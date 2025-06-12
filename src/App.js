import React, { useState } from "react";

const riskRecTemplates = {
  "Fall from heights": "Ensure that all elevated work areas are secured with proper fall protection measures such as guardrails, personal fall arrest systems, or designated tie-off points. Workers should be trained on hazard awareness and equipment use.",
  "Fall at same level": "Maintain clear, dry, and well-lit walking surfaces to prevent slips and trips. Ensure all walkways are free from clutter and transition areas are marked clearly.",
  "Material Handling": "Encourage the use of proper lifting techniques and mechanical aids to reduce strain. Ensure that handling paths are free of obstructions and storage is stable and accessible.",
  "Housekeeping": "Implement a regular housekeeping schedule to keep work areas clean, organized, and free of hazards such as debris, tools, and spills. Assign responsibility to designated personnel.",
  "Electrical": "All energized equipment should be properly labeled, and access restricted to qualified individuals. Inspect cords, panels, and outlets regularly for wear or damage.",
  "Struck-by": "Identify zones with potential for overhead or moving object hazards and implement controls like barricades, PPE, and visual alerts. Ensure operators and ground personnel maintain clear communication.",
  "Caught-in-between": "Verify that moving equipment, machinery, and pinch points are properly guarded. Establish protocols to prevent workers from entering confined or moving part zones during operations.",
  "Pinch-point": "Identify and label pinch hazard locations on tools, doors, and machinery. Reinforce safe hand positioning practices and the use of guards or barriers.",
  "Public Protection": "Restrict unauthorized public access to active work areas with barriers and clear signage. Ensure any work near pedestrian zones includes visibility controls and site monitoring.",
  "Other": "",
};

function App() {
  const [form, setForm] = useState({
    project: "",
    location: "",
    date: "",
    contact: "",
    consultant: "",
    objective: "",
    takeaways: "",
    planning: "",
    conclusion: "",
  });

  const [photos, setPhotos] = useState([]);
  const [recommendations, setRecommendations] = useState([
    {
      party: "",
      severity: "",
      area: "",
      areaDescription: "",
      recommendation: "",
      recPhotos: [],
    },
  ]);

  const [report, setReport] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files.map((file) => file.name));
  };

  const handleRecommendationChange = (index, e) => {
    const updated = [...recommendations];
    const { name, value } = e.target;

    if (name === "area") {
      updated[index].area = value;
      if (value !== "Other") {
        updated[index].recommendation = riskRecTemplates[value] || "";
        updated[index].areaDescription = "";
      } else {
        updated[index].recommendation = "";
      }
    } else {
      updated[index][name] = value;
    }

    setRecommendations(updated);
  };

  const handleRecPhotoUpload = (index, e) => {
    const files = Array.from(e.target.files);
    const updated = [...recommendations];
    updated[index].recPhotos = files.map((file) => file.name);
    setRecommendations(updated);
  };

  const addRecommendation = () => {
    setRecommendations([
      ...recommendations,
      {
        party: "",
        severity: "",
        area: "",
        areaDescription: "",
        recommendation: "",
        recPhotos: [],
      },
    ]);
  };

  const generateReport = () => {
    const photoList = photos.length
      ? photos.map((p) => `  - ${p}`).join("\n")
      : "  None provided";

    const tableHeader = `| Responsible Party | Severity | Area of Risk | Recommendation |
|-------------------|----------|--------------|----------------|`;

    const tableRows = recommendations
      .map((rec) => {
        const riskArea =
          rec.area === "Other" && rec.areaDescription
            ? `Other - ${rec.areaDescription}`
            : rec.area || "N/A";

        return `| ${rec.party || "N/A"} | ${rec.severity || "N/A"} | ${riskArea} | ${rec.recommendation || "N/A"} |`;
      })
      .join("\n");

    const recPhotosSection = recommendations
      .map((rec, i) => {
        const recPhotoText = rec.recPhotos.length
          ? rec.recPhotos.map((p) => `  - ${p}`).join("\n")
          : "  None submitted";
        return `Recommendation #${i + 1} Photos:\n${recPhotoText}`;
      })
      .join("\n\n");

    const output = `
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

${tableHeader}
${tableRows}

--------------------------------------------------------------
ATTACHED PHOTOS FOR RECOMMENDATIONS:

${recPhotosSection}

--------------------------------------------------------------
DISCLAIMER:

The information contained in this report is based on verbal responses, visual observations, and available documentation at the time of the visit. This report is provided solely for informational and advisory purposes to support risk awareness and operational improvement. It does not constitute legal advice, regulatory enforcement, or a compliance determination on behalf of any governmental agency. Peril Mavens is an independent consulting firm and does not represent OSHA or any regulatory authority. All recommendations are provided in good faith and based on professional judgment, but final decisions regarding implementation remain the responsibility of the client.

+--------------------------------------------------------------+
    `;
    setReport(output);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "monospace" }}>
      <img src="/peril-logo.png" alt="Peril Mavens Logo" style={{ width: "180px", marginBottom: "20px" }} />
      <h2>Engagement Confirmation Summary Generator</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "700px" }}>
        <input name="project" placeholder="Project Name" onChange={handleChange} />
        <input name="location" placeholder="Location" onChange={handleChange} />
        <input name="date" placeholder="Date of Visit" onChange={handleChange} />
        <input name="consultant" placeholder="Consultant Name" onChange={handleChange} />
        <input name="contact" placeholder="Onsite Contact" onChange={handleChange} />
        <textarea name="objective" placeholder="Visit Objective" rows={3} onChange={handleChange} />
        <textarea name="takeaways" placeholder="High-Level Takeaways" rows={3} onChange={handleChange} />
        <textarea name="planning" placeholder="Planning Ahead" rows={3} onChange={handleChange} />
        <textarea name="conclusion" placeholder="Conclusion" rows={3} onChange={handleChange} />

        <label>
          Upload General Photos:
          <input type="file" multiple onChange={handlePhotoUpload} />
        </label>

        <h3 style={{ marginTop: "20px" }}>Recommendations</h3>
        {recommendations.map((rec, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <input
              name="party"
              placeholder="Responsible Party"
              value={rec.party}
              onChange={(e) => handleRecommendationChange(index, e)}
              style={{ marginBottom: "5px", width: "100%" }}
            />
            <select
              name="severity"
              value={rec.severity}
              onChange={(e) => handleRecommendationChange(index, e)}
              style={{ marginBottom: "5px", width: "100%" }}
            >
              <option value="">Select Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="IDLH">IDLH (Immediately Dangerous to Life and Health)</option>
            </select>
            <select
              name="area"
              value={rec.area}
              onChange={(e) => handleRecommendationChange(index, e)}
              style={{ marginBottom: "5px", width: "100%" }}
            >
              <option value="">Select Area of Risk</option>
              {Object.keys(riskRecTemplates).map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            {rec.area === "Other" && (
              <input
                name="areaDescription"
                placeholder="Describe other area of risk"
                value={rec.areaDescription}
                onChange={(e) => handleRecommendationChange(index, e)}
                style={{ marginBottom: "5px", width: "100%" }}
              />
            )}
            <textarea
              name="recommendation"
              placeholder="Recommendation Narrative"
              value={rec.recommendation}
              onChange={(e) => handleRecommendationChange(index, e)}
              rows={2}
              style={{ width: "100%", marginBottom: "5px" }}
            />
            <label>
              Attach Photos for This Recommendation:
              <input
                type="file"
                multiple
                onChange={(e) => handleRecPhotoUpload(index, e)}
                style={{ display: "block", marginTop: "5px" }}
              />
            </label>
          </div>
        ))}
        <button onClick={addRecommendation} style={{ width: "fit-content", marginBottom: "20px" }}>
          + Add Another Recommendation
        </button>
        <button
          style={{ marginTop: "10px", padding: "10px", background: "#000", color: "#fff", border: "none" }}
          onClick={generateReport}
        >
          Generate Summary
        </button>
      </div>

      {report && (
        <pre
          style={{
            marginTop: "30px",
            background: "#f0f0f0",
            padding: "15px",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {report}
        </pre>
      )}
    </div>
  );
}

export default App;