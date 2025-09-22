import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./bitacora.css"; // Asegúrate de tener este archivo CSS

const sections = [
  "1. Asignación del Flujo de Trabajo",
  "2. Rastreador del Flujo de Trabajo",
  "3. Lista de Control",
  "5. Cronología de Eventos",
  "6. Sistemas",
  "7. Cuentas",
  "8. Indicadores del Host",
  "9. Indicadores de Red",
  "10. Inteligencia - RFI",
  "11. Rastreador de Evidencia",
  "12. Aplicaciones",
  "13. Palabras Clave Forenses",
  "14. Consultas de Investigación",
];

// Estructura de datos para la tabla de Consultas de Investigación
const initialInvestigationQueriesData = [
  {
    'ID de consulta': '',
    'Enviado por': '',
    'Plataforma': '',
    'Objetivo': '',
    'Consulta': '',
    'Notas': '',
  },
];

// Estructura de datos para la tabla de Palabras Clave Forenses
const initialForensicKeywordsData = [
  {
    'ID de palabra clave': '',
    'Palabras clave forenses de alta fidelidad': '',
    'Nota': '',
  },
];

// Estructura de datos para la tabla de Aplicaciones
const initialApplicationsData = [
  {
    'ID de la aplicación': '',
    'Enviado por': '',
    'Estado': '',
    'Nombre de la aplicación': '',
    'Nivel de aplicación': '',
    'Rol de la aplicación': '',
    'Grupo propietario': '',
    'Líder inicial': '',
    'Hallazgos': '',
    'evidencia más temprana (UTC)': '',
    'Última evidencia (UTC)': '',
    'Fuente': '',
    'Notas': '',
  },
];

// Estructura de datos para la tabla de Rastreador de Evidencia
const initialEvidenceData = [
  {
    'ubicación de la evidencia': '',
    'notas': '',
  },
];

// Estructura de datos para la tabla de Inteligencia - RFI
const initialRFIdata = [
  {
    'id de consulta': '',
    'enviado por': '',
    'estado': '',
    'solicitud de información': '',
    'respuesta': '',
    'fuente': '',
  },
];

const initialNetworkIndicatorsData = [
  {
    'id del indicador': '',
    'enviado por': '',
    'estado': '',
    'tipo de indicador': '',
    'indicador': '',
    'detalles/comentarios': '',
    'evidencia más temprana (UTC)': '',
    'última evidencia (UTC)': '',
    'alineación att&ck': '',
    'fuente': '',
    'notas': '',
  },
];

const initialHostIndicatorsData = [
  {
    'id del indicador': '',
    'enviado por': '',
    'estado': '',
    'tipo de indicador': '',
    'indicador': '',
    'descripción compleja o nombre': '',
    'hash': '',
    'md5': '',
    'sha1': '',
    'sha256': '',
    'detalles/comentarios': '',
    'colección más temprana (UTC)': '',
    'última evidencia (UTC)': '',
    'mapeo att&ck': '',
    'fuente': '',
    'notas': '',
  },
];

const initialAccountsData = [
  {
    'id de asset': '',
    'estado': '',
    'rol de la cuenta': '',
    'nombre de la cuenta': '',
    'sid': '',
    'dominio': '',
    'detalles/comentarios': '',
    'colección más temprana (UTC)': '',
    'última evidencia (UTC)': '',
    'notas': '',
  },
];

const initialSystemsData = [
  {
    'ubicación': '',
    'nombre de host': '',
    'dirección ip': '',
    'dominio': '',
    'rol del sistema': '',
    'sistema operativo': '',
    'detalles/comentarios': '',
    'notas': '',
  },
];

const initialEventsData = [
  {
    'enviado por': '',
    'tipo': '',
    'estado': '',
    'fecha/hora (UTC)': '',
    'nombre del sistema': '',
    'usuario/cuenta': '',
    'actividad': '',
    'fuente de evidencia': '',
    'ip de origen': '',
    'ip de destino': '',
    'detalles/comentarios': '',
    'mapeo a att&ck': '',
    'padre/hijo': '',
    'notas': '',
  },
];

const initialNotesData = [
  {
    'enviado por': '',
    'fecha/hora de adición': '',
    'categoría': '',
    'notas': '',
  },
];

const initialAssignmentData = [
  { 'flujo de trabajo': 'Alcance', 'dirigir': '', 'respondedor #1': '', 'respondedor #2': '', 'respondedor #3': '', 'respondedor #4': '' },
  { 'flujo de trabajo': 'Triaje', 'dirigir': '', 'respondedor #1': '', 'respondedor #2': '', 'respondedor #3': '', 'respondedor #4': '' },
  { 'flujo de trabajo': 'Inteligencia', 'dirigir': '', 'respondedor #1': '', 'respondedor #2': '', 'respondedor #3': '', 'respondedor #4': '' },
  { 'flujo de trabajo': 'Impacto', 'dirigir': '', 'respondedor #1': '', 'respondedor #2': '', 'respondedor #3': '', 'respondedor #4': '' },
];

const initialFormData = {
  cronologia: initialEventsData,
  sistemas: initialSystemsData,
  cuentas: initialAccountsData,
  indicadoresRed: initialNetworkIndicatorsData,
  indicadoresHost: initialHostIndicatorsData,
  evidencia: initialEvidenceData,
  aplicaciones: initialApplicationsData,
  otrasNotas: "",
  rastreadorFlujo: initialNotesData,
  asignacionFlujo: initialAssignmentData,
  listaControl: initialNotesData,
  notasInvestigacion: initialNotesData,
  consultas: initialInvestigationQueriesData,
  palabrasClave: initialForensicKeywordsData,
  inteligencia: initialRFIdata,
};

const sectionColors = {
  yellow: ["1. Asignación del Flujo de Trabajo", "2. Rastreador del Flujo de Trabajo", "3. Lista de Control", "4. Notas de la Investigación"],
  red: ["5. Cronología de Eventos", "6. Sistemas", "7. Cuentas", "8. Indicadores del Host", "9. Indicadores de Red", "10. Inteligencia - RFI"],
  gray: ["11. Rastreador de Evidencia", "12. Aplicaciones", "13. Palabras Clave Forenses", "14. Consultas de Investigación"],
};

const getSectionColorClass = (section) => {
  if (sectionColors.yellow.includes(section)) return "yellow-section";
  if (sectionColors.red.includes(section)) return "red-section";
  if (sectionColors.gray.includes(section)) return "gray-section";
  return "";
};

const Bitacora = () => {
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [formData, setFormData] = useState(initialFormData);

  // Nueva función para limpiar todos los formularios
  const handleClearForm = () => {
    setFormData(initialFormData);
    setActiveSection(sections[0]);
  };

  // Maneja cambios en inputs de las secciones de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja cambios en las tablas
  const handleEvidenceChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newEvidence = [...formData.evidencia];
    newEvidence[rowIndex][colName] = value;
    setFormData({ ...formData, evidencia: newEvidence });
  };

  const handleAssignmentChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newAssignment = [...formData.asignacionFlujo];
    newAssignment[rowIndex][colName] = value;
    setFormData({ ...formData, asignacionFlujo: newAssignment });
  };

  const handleTrackerChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newTracker = [...formData.rastreadorFlujo];
    newTracker[rowIndex][colName] = value;
    setFormData({ ...formData, rastreadorFlujo: newTracker });
  };

  const handleChecklistChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newChecklist = [...formData.listaControl];
    newChecklist[rowIndex][colName] = value;
    setFormData({ ...formData, listaControl: newChecklist });
  };

  const handleNotesChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newNotes = [...formData.notasInvestigacion];
    newNotes[rowIndex][colName] = value;
    setFormData({ ...formData, notasInvestigacion: newNotes });
  };

  const handleEventsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newEvents = [...formData.cronologia];
    newEvents[rowIndex][colName] = value;
    setFormData({ ...formData, cronologia: newEvents });
  };

  const handleSystemsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newSystems = [...formData.sistemas];
    newSystems[rowIndex][colName] = value;
    setFormData({ ...formData, sistemas: newSystems });
  };

  const handleAccountsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newAccounts = [...formData.cuentas];
    newAccounts[rowIndex][colName] = value;
    setFormData({ ...formData, cuentas: newAccounts });
  };

  const handleHostIndicatorsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newHostIndicators = [...formData.indicadoresHost];
    newHostIndicators[rowIndex][colName] = value;
    setFormData({ ...formData, indicadoresHost: newHostIndicators });
  };

  const handleNetworkIndicatorsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newNetworkIndicators = [...formData.indicadoresRed];
    newNetworkIndicators[rowIndex][colName] = value;
    setFormData({ ...formData, indicadoresRed: newNetworkIndicators });
  };

  const handleRFIChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newRFI = [...formData.inteligencia];
    newRFI[rowIndex][colName] = value;
    setFormData({ ...formData, inteligencia: newRFI });
  };

  const handleApplicationsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newApplications = [...formData.aplicaciones];
    newApplications[rowIndex][colName] = value;
    setFormData({ ...formData, aplicaciones: newApplications });
  };

  const handleForensicKeywordsChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newKeywords = [...formData.palabrasClave];
    newKeywords[rowIndex][colName] = value;
    setFormData({ ...formData, palabrasClave: newKeywords });
  };

  const handleInvestigationQueriesChange = (e, rowIndex, colName) => {
    const { value } = e.target;
    const newQueries = [...formData.consultas];
    newQueries[rowIndex][colName] = value;
    setFormData({ ...formData, consultas: newQueries });
  };

  // Funciones para agregar nuevas filas
  const addEvidenceRow = () => {
    setFormData(prevData => ({
      ...prevData,
      evidencia: [...prevData.evidencia, { ...initialEvidenceData[0] }],
    }));
  };

  const addRFIRow = () => {
    setFormData(prevData => ({
      ...prevData,
      inteligencia: [...prevData.inteligencia, { ...initialRFIdata[0] }],
    }));
  };

  const addNetworkIndicatorsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      indicadoresRed: [...prevData.indicadoresRed, { ...initialNetworkIndicatorsData[0] }],
    }));
  };

  const addHostIndicatorsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      indicadoresHost: [...prevData.indicadoresHost, { ...initialHostIndicatorsData[0] }],
    }));
  };

  const addAccountsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      cuentas: [...prevData.cuentas, { ...initialAccountsData[0] }],
    }));
  };

  const addSystemsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      sistemas: [...prevData.sistemas, { ...initialSystemsData[0] }],
    }));
  };

  const addEventsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      cronologia: [...prevData.cronologia, { ...initialEventsData[0] }],
    }));
  };

  const addNotesRow = () => {
    setFormData(prevData => ({
      ...prevData,
      notasInvestigacion: [...prevData.notasInvestigacion, { ...initialNotesData[0] }],
    }));
  };

  const addTrackerRow = () => {
    setFormData(prevData => ({
      ...prevData,
      rastreadorFlujo: [...prevData.rastreadorFlujo, { ...initialNotesData[0] }],
    }));
  };

  const addChecklistRow = () => {
    setFormData(prevData => ({
      ...prevData,
      listaControl: [...prevData.listaControl, { ...initialNotesData[0] }],
    }));
  };

  const addApplicationsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      aplicaciones: [...prevData.aplicaciones, { ...initialApplicationsData[0] }],
    }));
  };

  const addForensicKeywordsRow = () => {
    setFormData(prevData => ({
      ...prevData,
      palabrasClave: [...prevData.palabrasClave, { ...initialForensicKeywordsData[0] }],
    }));
  };

  const addInvestigationQueriesRow = () => {
    setFormData(prevData => ({
      ...prevData,
      consultas: [...prevData.consultas, { ...initialInvestigationQueriesData[0] }],
    }));
  };

  // Guardar en Excel
  const handleSaveExcel = () => {
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.asignacionFlujo), "1. Asignación Flujo de Trabajo");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.rastreadorFlujo), "2. Rastreador Flujo de Trabajo");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.listaControl), "3. Lista de Control");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.notasInvestigacion), "4. Notas de la Investigación");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.cronologia), "5. Cronología de Eventos");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.sistemas), "6. Sistemas");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.cuentas), "7. Cuentas");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.indicadoresHost), "8. Indicadores del Host");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.indicadoresRed), "9. Indicadores de Red");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.inteligencia), "10. Inteligencia - RFI");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.evidencia), "11. Rastreador de Evidencia");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.aplicaciones), "12. Aplicaciones");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.palabrasClave), "13. Palabras Clave Forenses");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData.consultas), "14. Consultas de Investigación");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "bitacora.xlsx");
  };

  // Render dinámico por sección
  const renderSection = () => {
    switch (activeSection) {
      case "1. Asignación del Flujo de Trabajo":
        const headersAssignment = Object.keys(initialAssignmentData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersAssignment.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.asignacionFlujo.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        {colName === 'flujo de trabajo' ? (
                          value
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleAssignmentChange(e, rowIndex, colName)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "2. Rastreador del Flujo de Trabajo":
        const headersTracker = Object.keys(initialNotesData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersTracker.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.rastreadorFlujo.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleTrackerChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addTrackerRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "3. Lista de Control":
        const headersChecklist = Object.keys(initialNotesData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersChecklist.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.listaControl.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleChecklistChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addChecklistRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "4. Notas de la Investigación":
        const headersNotes = Object.keys(initialNotesData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersNotes.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.notasInvestigacion.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleNotesChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addNotesRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "5. Cronología de Eventos":
        const headersEvents = Object.keys(initialEventsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersEvents.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.cronologia.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleEventsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addEventsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "6. Sistemas":
        const headersSystems = Object.keys(initialSystemsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersSystems.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.sistemas.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleSystemsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addSystemsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "7. Cuentas":
        const headersAccounts = Object.keys(initialAccountsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersAccounts.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.cuentas.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleAccountsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addAccountsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "8. Indicadores del Host":
        const headersHostIndicators = Object.keys(initialHostIndicatorsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersHostIndicators.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.indicadoresHost.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleHostIndicatorsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addHostIndicatorsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "9. Indicadores de Red":
        const headersNetworkIndicators = Object.keys(initialNetworkIndicatorsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersNetworkIndicators.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.indicadoresRed.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleNetworkIndicatorsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addNetworkIndicatorsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "10. Inteligencia - RFI":
        const headersRFI = Object.keys(initialRFIdata[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersRFI.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.inteligencia.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleRFIChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addRFIRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "11. Rastreador de Evidencia":
        const headersEvidence = Object.keys(initialEvidenceData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersEvidence.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.evidencia.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleEvidenceChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addEvidenceRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "12. Aplicaciones":
        const headersApplications = Object.keys(initialApplicationsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersApplications.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.aplicaciones.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleApplicationsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addApplicationsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "13. Palabras Clave Forenses":
        const headersForensicKeywords = Object.keys(initialForensicKeywordsData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersForensicKeywords.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.palabrasClave.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleForensicKeywordsChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addForensicKeywordsRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      case "14. Consultas de Investigación":
        const headersInvestigationQueries = Object.keys(initialInvestigationQueriesData[0]);
        return (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {headersInvestigationQueries.map(header => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.consultas.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.entries(row).map(([colName, value], colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleInvestigationQueriesChange(e, rowIndex, colName)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addInvestigationQueriesRow}
                className="add-row-button">
                + Agregar Fila
              </button>
            </div>
          </div>
        );
      default:
        // Renderizado para las secciones de texto genéricas
        const keyName = activeSection.toLowerCase().replace(/[.\s-]+/g, "");
        return (
          <textarea
            name={keyName}
            value={formData[keyName] || ""}
            onChange={handleChange}
            placeholder={`Información para ${activeSection}`}
            className="default-textarea"
          ></textarea>
        );
    }
  };

  return (
    <div className="bitacora-container">
      <h1 className="bitacora-heading">Bitácora Ciberdefensa</h1>
      <div className="bitacora-nav">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`bitacora-nav-button ${getSectionColorClass(section)} ${activeSection === section ? "active" : ""}`}
          >
            {section}
          </button>
        ))}
      </div>
      <div className="bitacora-content-box">
        <h2 className="bitacora-section-heading">{activeSection}</h2>
        {renderSection()}
        <div className="button-container">
          <button onClick={handleSaveExcel} className="bitacora-save-button">
            Guardar Bitácora
          </button>
          <button onClick={handleClearForm} className="bitacora-new-button">
            Limpiar Formularios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;