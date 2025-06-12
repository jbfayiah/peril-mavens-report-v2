import React, { useState } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

const riskRecTemplates = {
  "Fall from heights": "Ensure proper fall protection such as guardrails, harnesses, and training is in place when working above ground level.",
  "Fall at same level": "Maintain clean walking surfaces, mark transitions clearly, and use slip-resistant materials to prevent same-level falls.",
  "Material Handling": "Use proper lifting techniques and ensure materials are stacked securely and accessibly.",
  "Housekeeping": "Implement daily cleanup routines to remove clutter, debris, and tripping hazards.",
  "Electrical": "Ensure energized equipment is labeled, inspected regularly, and only accessed by qualified personnel.",
  "Struck-by": "Use barricades, PPE, and visible alerts in areas with moving equipment or overhead hazards.",
  "Caught-in-between": "Ensure moving machinery is guarded and workers are trained on staying clear of pinch zones.",
  "Pinch-point": "Identify pinch hazards and use signage and guards to prevent injuries.",
  "Public Protection": "Install barriers and signage to separate the public from active work zones.",
  "Other": ""
};

function App() {
  const [form, setForm] = useState({
    project: "", location: "", date: "", consultant: "", contact: "",
    objective: "", takeaways: "", planning: "", conclusion: ""
  });

  const [photos, setPhotos] = useState([]);
  const [recommendations, setRecommendations] = useState([
    { party: "", severity: "", area: "", areaDescription: "", recommendation: "", recPhotos: [] }
  ]);

  const [report, setReport] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleRecPhotoUpload = (index, e) => {
    const files = Array.from(e.target.files);
    const updated = [...recommendations];
    updated[index].recPhotos = files;
    setRecommendations(updated);
  };

  const handleRecommendationChange = (i, e) => {
    const { name, value } = e.target;
    const updated = [...recommendations];
    if (name === "area") {
      updated[i].area = value;
      updated[i].recommendation = riskRecTemplates[value] || "";
      updated[i].areaDescription = "";
    } else {
      updated[i][name] = value;
    }
    setRecommendations(updated);
  };

  const addRecommendation = () => {
    setRecommendations([
      ...recommendations,
      { party: "", severity: "", area: "", areaDescription: "", recommendation: "", recPhotos: [] }
    ]);
  };

  const validateForm = () => {
    const required = ["project", "location", "date", "consultant", "contact"];
    return required.every(f => form[f].trim() !== "");
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const generateReport = () => {
    if (!validateForm()) {
      alert("Please fill out all required fields before generating the summary.");
      return;
    }

    const photoList = photos.length > 0 ? photos.map(f => `  - ${f.name}`).join("\n") : "  None provided";

    const table = recommendations.map((r, i) => {
      const area = r.area === "Other" ? `Other - ${r.areaDescription}` : r.area;
      return `| ${r.party || "N/A"} | ${r.severity || "N/A"} | ${area || "N/A"} | ${r.recommendation || "N/A"} |`;
    }).join("\n");

    const recPhotos = recommendations.map((r, i) => {
      const list = r.recPhotos.length > 0 ? r.recPhotos.map(p => `  - ${p.name}`).join("\n") : "  None submitted";
      return `Recommendation #${i + 1} Photos:\n${list}`;
    }).join("\n\n");

    const summary = `
+--------------------------------------------------------------+
|             ENGAGEMENT CONFIRMATION SUMMARY                 |
+--------------------------------------------------------------+

Project: ${form.project}
Location: ${form.location}
Date of Visit: ${form.date}
Consultant: ${form.consultant}
Onsite Contact: ${form.contact}

--------------------------------------------------------------
Dear ${form.contact || "[Onsite Contact]"},

--------------------------------------------------------------
VISIT OBJECTIVE:
${form.objective}

--------------------------------------------------------------
HIGH-LEVEL TAKEAWAYS:
${form.takeaways}

--------------------------------------------------------------
PLANNING AHEAD:
${form.planning}

--------------------------------------------------------------
CONCLUSION:
${form.conclusion}

--------------------------------------------------------------
PHOTOS SUBMITTED:
${photoList}

--------------------------------------------------------------
RECOMMENDATIONS:
| Responsible Party | Severity | Area of Risk | Recommendation |
|-------------------|----------|--------------|----------------|
${table}

--------------------------------------------------------------
ATTACHED PHOTOS FOR RECOMMENDATIONS:

${recPhotos}

--------------------------------------------------------------
DISCLAIMER:
The information contained in this report is based on verbal responses, visual observations, and available documentation at the time of the visit. This report is provided solely for informational and advisory purposes to support risk awareness and operational improvement. It does not constitute legal advice, regulatory enforcement, or a compliance determination on behalf of any governmental agency. Peril Mavens is an independent consulting firm and does not represent OSHA or any regulatory authority. All recommendations are provided in good faith and based on professional judgment, but final decisions regarding implementation remain the responsibility of the client.

+--------------------------------------------------------------+`;

    setReport(summary);
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    doc.setFont("Courier", "normal");
    const lines = report.split("\n");
    let y = 10;
    lines.forEach((line) => {
      const split = doc.splitTextToSize(line, 180);
      split.forEach(l => {
        doc.text(l, 10, y);
        y += 7;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });
    });

    for (const photo of photos) {
      const base64 = await fileToBase64(photo);
      doc.addPage();
      doc.text(`General Photo: ${photo.name}`, 10, 10);
      doc.addImage(base64, 'JPEG', 10, 20, 100, 75);
    }

    for (let i = 0; i < recommendations.length; i++) {
      for (const photo of recommendations[i].recPhotos) {
        const base64 = await fileToBase64(photo);
        doc.addPage();
        doc.text(`Rec #${i + 1} Photo: ${photo.name}`, 10, 10);
        doc.addImage(base64, 'JPEG', 10, 20, 100, 75);
      }
    }

    doc.save("Engagement_Confirmation_Summary.pdf");
  };

  const downloadDocx = async () => {
    const doc = new Document({
      sections: [
        {
          children: report.split("\n").map(line => new Paragraph(line))
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Engagement_Confirmation_Summary.docx");
  };

  return (
    <div style={{ padding: 30, fontFamily: "monospace", maxWidth: 700 }}>
      <h2>Engagement Confirmation Summary Generator</h2>

      {["project", "location", "consultant", "contact"].map(field => (
        <input
          key={field}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          onChange={handleChange}
          style={{ marginBottom: 10, width: "100%" }}
        />
      ))}
      <label>
        Date of Visit:
        <input type="date" name="date" onChange={handleChange} style={{ display: "block", marginBottom: 10, width: "100%" }} />
      </label>
      {["objective", "takeaways", "planning", "conclusion"].map(field => (
        <textarea
          key={field}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          rows={3}
          onChange={handleChange}
          style={{ marginBottom: 10, width: "100%" }}
        />
      ))}
      <label>
        Upload General Photos:
        <input type="file" multiple onChange={handlePhotoUpload} style={{ display: "block", marginBottom: 20 }} />
      </label>

      <h3>Recommendations</h3>
      {recommendations.map((r, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <input name="party" placeholder="Responsible Party" value={r.party} onChange={e => handleRecommendationChange(i, e)} style={{ width: "100%", marginBottom: 5 }} />
          <select name="severity" value={r.severity} onChange={e => handleRecommendationChange(i, e)} style={{ width: "100%", marginBottom: 5 }}>
            <option value="">Select Severity</option>
            <option value="Low">Low</option><option value="Medium">Medium</option>
            <option value="High">High</option><option value="IDLH">IDLH</option>
          </select>
          <select name="area" value={r.area} onChange={e => handleRecommendationChange(i, e)} style={{ width: "100%", marginBottom: 5 }}>
            <option value="">Select Area of Risk</option>
            {Object.keys(riskRecTemplates).map(key => <option key={key} value={key}>{key}</option>)}
          </select>
          {r.area === "Other" && (
            <input
              name="areaDescription"
              placeholder="Describe Other Area"
              value={r.areaDescription}
              onChange={e => handleRecommendationChange(i, e)}
              style={{ width: "100%", marginBottom: 5 }}
            />
          )}
          <textarea
            name="recommendation"
            placeholder="Recommendation"
            value={r.recommendation}
            onChange={e => handleRecommendationChange(i, e)}
            rows={2}
            style={{ width: "100%", marginBottom: 5 }}
          />
          <label>
            Attach Photos:
            <input type="file" multiple onChange={e => handleRecPhotoUpload(i, e)} style={{ display: "block", marginTop: 5 }} />
          </label>
        </div>
      ))}
      <button onClick={addRecommendation}>+ Add Another Recommendation</button>

      <button onClick={generateReport} style={{ marginTop: 20 }}>Generate Summary</button>

      {report && (
        <>
          <pre style={{ background: "#f0f0f0", padding: 15, marginTop: 30, whiteSpace: "pre-wrap" }}>{report}</pre>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={downloadPDF}>📄 Download as PDF</button>
            <button onClick={downloadDocx}>📝 Download as Word</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

