// src/emailTemplates/newApplicationEmail.js

export function newApplicationEmail(finalData) {
  // 1) Función para dar formato a los nombres de los campos
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Insertar espacio antes de cada mayúscula
      .replace(/^./, (str) => str.toUpperCase()); // Capitalizar la primera letra
  };

  // 2) Función para eliminar campos con valores "N/A" o vacíos
  //    Retorna siempre un HTML válido aunque no haya datos
  const filterFields = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return "<p>No hay datos disponibles.</p>";
    }

    // Filtramos valores falsy o "N/A"
    const filtered = Object.entries(data)
      .filter(([key, value]) => key && value && value !== "N/A")
      .map(([key, value]) => `<li><strong>${formatKey(key)}:</strong> ${value}</li>`)
      .join("");

    return filtered.length > 0
      ? filtered
      : "<p>No hay datos disponibles.</p>";
  };

  // 3) Variables principales sacadas de finalData
  const pInfo = finalData.personalInfo || {};
  const proInfo = finalData.professionalInfo || {};
  const immInfo = finalData.immigrationInfo || {};
  const insInfo = finalData.insuranceInfo || {};
  const relInfo = finalData.relativesInfo || {}; // Aquí están beneficiarios y padres
  const agentInfo = finalData.agentInfo || {};
  
  const personalInfoOrder = [
    "firstName",
    "lastName",
    "dob",
    "phone",
    "email",
    "address",
    "height",
    "smoker",
    "bankName",
    "accountNumber",
    "routingNumber"
  ];
  
  
  const filterFieldsOrdered = (data, order) => {
    if (!data || Object.keys(data).length === 0) {
      return "<p>No hay datos disponibles.</p>";
    }
  
    return order
      .map((key) => {
        if (data[key] && data[key] !== "N/A") {
          return `<li><strong>${formatKey(key)}:</strong> ${data[key]}</li>`;
        }
        return "";
      })
      .join("") || "<p>No hay datos disponibles.</p>";
  };
  // 4) Manejo de Beneficiarios (array)
  const beneficiariesArray = Array.isArray(relInfo.beneficiaries)
    ? relInfo.beneficiaries
    : [];

  // =======================
  // BLOQUE BENEFICIARIOS
  // =======================
  const beneficiariesSection = `
    <td width="50%" valign="top" style="padding: 10px;">
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
      >
        <tr>
          <td align="center">
            <img
              src="https://applicationform.financiegroup.com/icons/beneficiaries.png"
              width="40"
              alt="Beneficiarios Icon"
            />
          </td>
        </tr>
        <tr>
          <td
            align="center"
            style="font-size: 18px; font-weight: bold; color: #f6d84c;"
          >
            Beneficiarios
          </td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #666;">
            ${
              beneficiariesArray.length > 0
                ? `
              <ul>
                ${beneficiariesArray
                  .map(
                    (b, idx) => `
                  <li style="margin-bottom:8px;">
                    <strong>Beneficiario #${idx + 1}:</strong><br />
                    <strong>Nombre:</strong> ${b.fullName || "N/A"}<br />
                    <strong>Fecha de Nacimiento:</strong> ${b.dob || "N/A"}<br />
                    <strong>Relación:</strong> ${b.relationship || "N/A"}
                  </li>
                `
                  )
                  .join("")}
              </ul>`
                : `<p>No hay beneficiarios registrados.</p>`
            }
          </td>
        </tr>
      </table>
    </td>
  `;

  // =======================
  // BLOQUE PADRES
  // =======================
  const parentsSection = `
    <td width="50%" valign="top" style="padding: 10px;">
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
      >
        <tr>
          <td align="center">
            <img
              src="https://applicationform.financiegroup.com/icons/family.png"
              width="40"
              alt="Parents Info Icon"
            />
          </td>
        </tr>
        <tr>
          <td
            align="center"
            style="font-size: 18px; font-weight: bold; color: #f6d84c;"
          >
            Información de los Padres
          </td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #666;">
            <ul>
              <li><strong>¿Madre Vive?:</strong> ${relInfo.motherLiving || "N/A"}</li>
              <li><strong>Edad Madre:</strong> ${relInfo.motherAge || "N/A"}</li>
              <li><strong>Causa Fallecimiento Madre:</strong> ${relInfo.motherCauseOfDeath || "N/A"}</li>
              <br/>
              <li><strong>¿Padre Vive?:</strong> ${relInfo.fatherLiving || "N/A"}</li>
              <li><strong>Edad Padre:</strong> ${relInfo.fatherAge || "N/A"}</li>
              <li><strong>Causa Fallecimiento Padre:</strong> ${relInfo.fatherCauseOfDeath || "N/A"}</li>
            </ul>
          </td>
        </tr>
      </table>
    </td>
  `;

  // =======================
  // CONSTRUIMOS EL HTML
  // =======================
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="background-color: #f2f4f7; padding: 20px;"
    >
      <tr>
        <td align="center">
          <!-- Contenedor principal, ancho 800 -->
          <table
            role="presentation"
            width="800"
            cellspacing="0"
            cellpadding="0"
            style="background-color: #ffffff; border-radius: 12px; padding: 20px;"
          >
            <!-- Título principal -->
            <tr>
              <td align="center" style="font-size: 24px; font-weight: bold; color: #f6d84c;">
              <img src="https://applicationform.financiegroup.com/icons/logo.png" width="400" alt="Insurance Info Icon"/>
              </td>
            </tr>

            <!-- PRIMERA FILA: Personal + Profesional -->
            <tr>
              <!-- Personal Info -->
              ${
                filterFieldsOrdered(pInfo, personalInfoOrder)
                  ? `
                <td width="50%" valign="top" style="padding: 10px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
                    <tr>
                      <td align="center">
                        <img
                          src="https://applicationform.financiegroup.com/icons/women.png"
                          width="40"
                          alt="Personal Info Icon"
                        />
                        <img
                          src="https://applicationform.financiegroup.com/icons/man.png"
                          width="40"
                          alt="Personal Info Icon"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        style="font-size: 18px; font-weight: bold; color: #f6d84c;"
                      >
                        Información Personal
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #666;">
                        <ul>${filterFieldsOrdered(pInfo, personalInfoOrder)}</ul>
                      </td>
                    </tr>
                  </table>
                </td>
              `
                  : `<td width="50%" style="padding:10px;"></td>`
              }

              <!-- Professional Info -->
              ${
                filterFields(proInfo)
                  ? `
                <td width="50%" valign="top" style="padding: 10px;">
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
                  >
                    <tr>
                      <td align="center">
                        <img
                          src="https://applicationform.financiegroup.com/icons/professional.png"
                          width="40"
                          alt="Professional Info Icon"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        style="font-size: 18px; font-weight: bold; color: #f6d84c;"
                      >
                        Información Profesional
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #666;">
                        <ul>${filterFields(proInfo)}</ul>
                      </td>
                    </tr>
                  </table>
                </td>
              `
                  : `<td width="50%" style="padding:10px;"></td>`
              }
            </tr>

            <!-- SEGUNDA FILA: Migratoria + Seguro -->
            <tr>
              <!-- Immigration Info -->
              ${
                filterFields(immInfo)
                  ? `
                <td width="50%" valign="top" style="padding: 10px;">
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
                  >
                    <tr>
                      <td align="center">
                        <img
                          src="https://applicationform.financiegroup.com/icons/inmigration.png"
                          width="40"
                          alt="Immigration Info Icon"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        style="font-size: 18px; font-weight: bold; color: #f6d84c;"
                      >
                        Información Migratoria
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #666;">
                        <ul>${filterFields(immInfo)}</ul>
                      </td>
                    </tr>
                  </table>
                </td>
              `
                  : `<td width="50%" style="padding:10px;"></td>`
              }

              <!-- Insurance Info -->
              ${
                filterFields(insInfo)
                  ? `
                <td width="50%" valign="top" style="padding: 10px;">
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
                  >
                    <tr>
                      <td align="center">
                        <img
                          src="https://applicationform.financiegroup.com/icons/medical.png"
                          width="40"
                          alt="Insurance Info Icon"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="center"
                        style="font-size: 18px; font-weight: bold; color: #f6d84c;"
                      >
                        Información del Seguro
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #666;">
                        <ul>${filterFields(insInfo)}</ul>
                      </td>
                    </tr>
                  </table>
                </td>
              `
                  : `<td width="50%" style="padding:10px;"></td>`
              }
            </tr>

            <!-- TERCERA FILA: Beneficiarios + Información de Padres -->
            <tr>
              ${beneficiariesSection}
              ${
                filterFields(relInfo)
                  ? parentsSection
                  : `<td width="50%" style="padding:10px;"></td>`
              }
            </tr>

            <!-- CUARTA FILA: Información del Agente (sección completa) -->
            <tr>
              <td colspan="2" width="100%" valign="top" style="padding: 10px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  style="background: #f8f9fa; border-radius: 8px; padding: 15px;"
                >
                  <tr>
                    <td align="center">
                      <img
                          src="https://applicationform.financiegroup.com/icons/agentW.png"
                          width="40"
                          alt="Insurance Info Icon"
                        />
                      <img
                          src="https://applicationform.financiegroup.com/icons/agentM.png"
                          width="40"
                          alt="Insurance Info Icon"
                        />
                    </td>
                  </tr>
                  <tr>
                    <td
                      align="center"
                      style="font-size: 18px; font-weight: bold; color: #f6d84c;"
                    >
                      Información del Agente
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #666;">
                      <ul style="list-style-type:none; padding-left:0;">
                        <li><strong>Nombre:</strong> ${agentInfo.agentName || "No disponible"}</li>
                        <li><strong>Email:</strong> ${agentInfo.agentEmail || "No disponible"}</li>
                        <li><strong>Teléfono:</strong> ${agentInfo.agentPhone || "No disponible"}</li>
                        ${
                          agentInfo.split === "Yes"
                            ? `
                        <li><strong>Segundo Agente:</strong> ${
                          agentInfo.secondAgentEmail || "No disponible"
                        }</li>
                        <li><strong>Teléfono Segundo Agente:</strong> ${
                          agentInfo.secondAgentPhone || "No disponible"
                        }</li>
                        `
                            : ""
                        }
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  `;
}
