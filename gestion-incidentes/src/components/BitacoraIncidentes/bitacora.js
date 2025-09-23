import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import './bitacora.css';

// Estandarización de la URL del backend
const API_BASE_URL = 'http://localhost/gestion-incidentes/backend';

const sections = [
  "1. Asignación del Flujo de Trabajo",
  "2. Rastreador del Flujo de Trabajo",
  "3. Lista de Control",
  "4. Notas de la Investigación",
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

// ... (initial data definitions remain the same) ...
const initialInvestigationQueriesData = [{ 'ID de consulta': '', 'Enviado por': '', 'Plataforma': '', 'Objetivo': '', 'Consulta': '', 'Notas': '' }];
const initialForensicKeywordsData = [{ 'ID de palabra clave': '', 'Palabras clave forenses de alta fidelidad': '', 'Nota': '' }];
const initialApplicationsData = [{ 'ID de la aplicación': '', 'Enviado por': '', 'Estado': '', 'Nombre de la aplicación': '', 'Nivel de aplicación': '', 'Rol de la aplicación': '', 'Grupo propietario': '', 'Líder inicial': '', 'Hallazgos': '', 'evidencia más temprana (UTC)': '', 'Última evidencia (UTC)': '', 'Fuente': '', 'Notas': '' }];
const initialEvidenceData = [{ 'ubicación de la evidencia': '', 'notas': '' }];
const initialRFIdata = [{ 'id de consulta': '', 'enviado por': '', 'estado': '', 'solicitud de información': '', 'respuesta': '', 'fuente': '' }];
const initialNetworkIndicatorsData = [{ 'id del indicador': '', 'enviado por': '', 'estado': '', 'tipo de indicador': '', 'indicador': '', 'detalles/comentarios': '', 'evidencia más temprana (UTC)': '', 'última evidencia (UTC)': '', 'alineación att&ck': '', 'fuente': '', 'notas': '' }];
const initialHostIndicatorsData = [{ 'id del indicador': '', 'enviado por': '', 'estado': '', 'tipo de indicador': '', 'indicador': '', 'descripción compleja o nombre': '', 'hash': '', 'md5': '', 'sha1': '', 'sha256': '', 'detalles/comentarios': '', 'colección más temprana (UTC)': '', 'última evidencia (UTC)': '', 'mapeo att&ck': '', 'fuente': '', 'notas': '' }];
const initialAccountsData = [{ 'id de asset': '', 'estado': '', 'rol de la cuenta': '', 'nombre de la cuenta': '', 'sid': '', 'dominio': '', 'detalles/comentarios': '', 'colección más temprana (UTC)': '', 'última evidencia (UTC)': '', 'notas': '' }];
const initialSystemsData = [{ 'ubicación': '', 'nombre de host': '', 'dirección ip': '', 'dominio': '', 'rol del sistema': '', 'sistema operativo': '', 'detalles/comentarios': '', 'notas': '' }];
const initialEventsData = [{ 'enviado por': '', 'tipo': '', 'estado': '', 'fecha/hora (UTC)': '', 'nombre del sistema': '', 'usuario/cuenta': '', 'actividad': '', 'fuente de evidencia': '', 'ip de origen': '', 'ip de destino': '', 'detalles/comentarios': '', 'mapeo a att&ck': '', 'padre/hijo': '', 'notas': '' }];
const initialNotesData = [{ 'enviado por': '', 'fecha/hora de adición': '', 'categoría': '', 'notas': '' }];
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
    rastreadorFlujo: initialNotesData,
    asignacionFlujo: initialAssignmentData,
    listaControl: initialNotesData,
    notasInvestigacion: initialNotesData,
    consultas: initialInvestigationQueriesData,
    palabrasClave: initialForensicKeywordsData,
    inteligencia: initialRFIdata,
};

const getSectionClass = (section, activeSection) => {
    const classMap = { active: 'is-active', workflow: 'is-workflow', investigation: 'is-investigation', intel: 'is-intel', default: 'is-default' };
    if (section === activeSection) return classMap.active;
    if (sections.indexOf(section) < 4) return classMap.workflow;
    if (sections.indexOf(section) < 10) return classMap.investigation;
    if (sections.indexOf(section) < 14) return classMap.intel;
    return classMap.default;
};

const Bitacora = () => {
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
    const [amenazaTitle, setAmenazaTitle] = useState('Nueva Amenaza');
    const [leadInvestigator, setLeadInvestigator] = useState('');

    const handleClearForm = () => {
        setFormData(JSON.parse(JSON.stringify(initialFormData)));
        setAmenazaTitle('Nueva Amenaza');
        setLeadInvestigator('');
        setActiveSection(sections[0]);
    };

    const handleTableChange = (section, rowIndex, colName, value) => {
        const newSectionData = [...formData[section]];
        newSectionData[rowIndex][colName] = value;
        setFormData({ ...formData, [section]: newSectionData });
    };

    const addRow = (section, initialData) => {
        setFormData(prevData => ({ ...prevData, [section]: [...prevData[section], { ...initialData[0] }] }));
    };
    
    const handleSaveToDB = async () => {
        const payload = {
            title: amenazaTitle,
            lead_investigator: leadInvestigator,
            status: 'Abierto',
            formData: formData
        };

        try {
            // Usando fetch y la URL estandarizada
            const response = await fetch(`${API_BASE_URL}/api_amenaza.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                alert(`¡Éxito! Amenaza guardada con ID: ${result.amenaza_id}`);
                handleClearForm();
            } else {
                alert(`Error al guardar: ${result.message}`);
            }
        } catch (error) {
            console.error("Error de conexión o en la API:", error);
            alert("Hubo un error de conexión. Revisa la consola para más detalles.");
        }
    };

    const handleSaveExcel = () => {
        const workbook = XLSX.utils.book_new();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key]) && formData[key].length > 0) {
                const sectionName = Object.keys(sectionComponentMap).find(name => sectionComponentMap[name].dataKey === key);
                const sheetName = sectionName ? sectionName.substring(0, 31) : key.substring(0, 31);
                const worksheet = XLSX.utils.json_to_sheet(formData[key]);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
        });
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${amenazaTitle.replace(/ /g, "_")}.xlsx`);
    };

    // ... (sectionComponentMap and render functions remain the same) ...
    const sectionComponentMap = {
        "1. Asignación del Flujo de Trabajo": { dataKey: 'asignacionFlujo', initialData: null },
        "2. Rastreador del Flujo de Trabajo": { dataKey: 'rastreadorFlujo', initialData: initialNotesData },
        "3. Lista de Control": { dataKey: 'listaControl', initialData: initialNotesData },
        "4. Notas de la Investigación": { dataKey: 'notasInvestigacion', initialData: initialNotesData },
        "5. Cronología de Eventos": { dataKey: 'cronologia', initialData: initialEventsData },
        "6. Sistemas": { dataKey: 'sistemas', initialData: initialSystemsData },
        "7. Cuentas": { dataKey: 'cuentas', initialData: initialAccountsData },
        "8. Indicadores del Host": { dataKey: 'indicadoresHost', initialData: initialHostIndicatorsData },
        "9. Indicadores de Red": { dataKey: 'indicadoresRed', initialData: initialNetworkIndicatorsData },
        "10. Inteligencia - RFI": { dataKey: 'inteligencia', initialData: initialRFIdata },
        "11. Rastreador de Evidencia": { dataKey: 'evidencia', initialData: initialEvidenceData },
        "12. Aplicaciones": { dataKey: 'aplicaciones', initialData: initialApplicationsData },
        "13. Palabras Clave Forenses": { dataKey: 'palabrasClave', initialData: initialForensicKeywordsData },
        "14. Consultas de Investigación": { dataKey: 'consultas', initialData: initialInvestigationQueriesData },
    };

    const renderSectionContent = () => {
        const config = sectionComponentMap[activeSection];
        if (!config) return null;
        const data = formData[config.dataKey];
        if (!data || data.length === 0) return <p>No hay datos para esta sección.</p>;
        const headers = Object.keys(data[0]);

        return (
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {headers.map(header => <th key={header}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {headers.map(colName => (
                                    <td key={colName}>
                                        {colName === 'flujo de trabajo' && activeSection === "1. Asignación del Flujo de Trabajo" ? (
                                            <span className="readonly-cell">{row[colName]}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={row[colName]}
                                                onChange={(e) => handleTableChange(config.dataKey, rowIndex, colName, e.target.value)}
                                                className="table-input"
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {config.initialData && (
                    <div className="table-actions">
                        <button onClick={() => addRow(config.dataKey, config.initialData)} className="add-row-button">+ Agregar Fila</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bitacora-container">
            <main className="bitacora-content">
                <h1 className="main-title">Bitácora de Ciberdefensa</h1>

                <nav className="bitacora-tabs-container">
                    {sections.map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`bitacora-tab ${getSectionClass(section, activeSection)}`}
                        >
                            {section}
                        </button>
                    ))}
                </nav>

                <div className="content-card">
                    <div className="amenaza-details-inputs">
                         <input
                            type="text"
                            value={amenazaTitle}
                            onChange={(e) => setAmenazaTitle(e.target.value)}
                            placeholder="Título de la Amenaza"
                            className="amenaza-title-input"
                        />
                        <input
                            type="text"
                            value={leadInvestigator}
                            onChange={(e) => setLeadInvestigator(e.target.value)}
                            placeholder="Investigador Principal"
                            className="amenaza-lead-input"
                        />
                    </div>
                    <h2 className="section-title">{activeSection}</h2>
                    {renderSectionContent()}
                    <div className="main-actions">
                        <button onClick={handleSaveToDB} className="action-button save-button">
                            Guardar Amenaza en BD
                        </button>
                         <button onClick={handleSaveExcel} className="action-button excel-button">
                            Exportar a Excel
                        </button>
                        <button onClick={handleClearForm} className="action-button clear-button">
                            Limpiar Formulario
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Bitacora;
