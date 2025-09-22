import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

// Data Structures
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

const sectionColorClasses = {
    yellow: "bg-yellow-100 border-yellow-500 text-yellow-800",
    red: "bg-red-100 border-red-500 text-red-800",
    gray: "bg-gray-100 border-gray-500 text-gray-800",
    default: "bg-white border-gray-300 text-gray-700",
    active: "bg-blue-500 border-blue-700 text-white",
};

const getSectionColorClass = (section, activeSection) => {
    if (section === activeSection) return sectionColorClasses.active;
    if (sections.slice(0, 4).includes(section)) return sectionColorClasses.yellow;
    if (sections.slice(4, 10).includes(section)) return sectionColorClasses.red;
    if (sections.slice(10, 14).includes(section)) return sectionColorClasses.gray;
    return sectionColorClasses.default;
};


const Bitacora = () => {
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [formData, setFormData] = useState(initialFormData);

    const handleClearForm = () => {
        setFormData(JSON.parse(JSON.stringify(initialFormData))); // Deep copy
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

    const handleSaveExcel = () => {
        const workbook = XLSX.utils.book_new();
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                const sheetName = sections.find(s => s.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, '')) || key;
                XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formData[key]), sheetName.substring(0, 31));
            }
        });
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "bitacora.xlsx");
    };

    const renderSection = () => {
        const sectionMap = {
            "1. Asignación del Flujo de Trabajo": { data: formData.asignacionFlujo, handler: (e, r, c) => handleTableChange("asignacionFlujo", r, c, e.target.value) },
            "2. Rastreador del Flujo de Trabajo": { data: formData.rastreadorFlujo, handler: (e, r, c) => handleTableChange("rastreadorFlujo", r, c, e.target.value), addRow: () => addRow('rastreadorFlujo', initialNotesData) },
            "3. Lista de Control": { data: formData.listaControl, handler: (e, r, c) => handleTableChange("listaControl", r, c, e.target.value), addRow: () => addRow('listaControl', initialNotesData) },
            "4. Notas de la Investigación": { data: formData.notasInvestigacion, handler: (e, r, c) => handleTableChange("notasInvestigacion", r, c, e.target.value), addRow: () => addRow('notasInvestigacion', initialNotesData) },
            "5. Cronología de Eventos": { data: formData.cronologia, handler: (e, r, c) => handleTableChange("cronologia", r, c, e.target.value), addRow: () => addRow('cronologia', initialEventsData) },
            "6. Sistemas": { data: formData.sistemas, handler: (e, r, c) => handleTableChange("sistemas", r, c, e.target.value), addRow: () => addRow('sistemas', initialSystemsData) },
            "7. Cuentas": { data: formData.cuentas, handler: (e, r, c) => handleTableChange("cuentas", r, c, e.target.value), addRow: () => addRow('cuentas', initialAccountsData) },
            "8. Indicadores del Host": { data: formData.indicadoresHost, handler: (e, r, c) => handleTableChange("indicadoresHost", r, c, e.target.value), addRow: () => addRow('indicadoresHost', initialHostIndicatorsData) },
            "9. Indicadores de Red": { data: formData.indicadoresRed, handler: (e, r, c) => handleTableChange("indicadoresRed", r, c, e.target.value), addRow: () => addRow('indicadoresRed', initialNetworkIndicatorsData) },
            "10. Inteligencia - RFI": { data: formData.inteligencia, handler: (e, r, c) => handleTableChange("inteligencia", r, c, e.target.value), addRow: () => addRow('inteligencia', initialRFIdata) },
            "11. Rastreador de Evidencia": { data: formData.evidencia, handler: (e, r, c) => handleTableChange("evidencia", r, c, e.target.value), addRow: () => addRow('evidencia', initialEvidenceData) },
            "12. Aplicaciones": { data: formData.aplicaciones, handler: (e, r, c) => handleTableChange("aplicaciones", r, c, e.target.value), addRow: () => addRow('aplicaciones', initialApplicationsData) },
            "13. Palabras Clave Forenses": { data: formData.palabrasClave, handler: (e, r, c) => handleTableChange("palabrasClave", r, c, e.target.value), addRow: () => addRow('palabrasClave', initialForensicKeywordsData) },
            "14. Consultas de Investigación": { data: formData.consultas, handler: (e, r, c) => handleTableChange("consultas", r, c, e.target.value), addRow: () => addRow('consultas', initialInvestigationQueriesData) },
        };

        const current = sectionMap[activeSection];
        if (!current) return null;

        const headers = Object.keys(current.data[0] || {});

        return (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map(header => <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {current.data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-100">
                                {headers.map(colName => (
                                    <td key={colName} className="px-6 py-4 whitespace-nowrap text-sm">
                                        {colName === 'flujo de trabajo' && activeSection === "1. Asignación del Flujo de Trabajo" ? (
                                            <span className="font-semibold">{row[colName]}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={row[colName]}
                                                onChange={(e) => current.handler(e, rowIndex, colName)}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {current.addRow && (
                    <div className="p-4 bg-gray-50 text-right">
                        <button onClick={current.addRow} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ Agregar Fila</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white shadow-lg p-4 space-y-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Bitácora Ciberdefensa</h1>
                {sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 text-sm font-medium border-l-4 ${getSectionColorClass(section, activeSection)}`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            {/* Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{activeSection}</h2>
                    {renderSection()}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button onClick={handleSaveExcel} className="w-full sm:w-auto flex-1 px-6 py-3 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105">
                            Guardar Bitácora (Excel)
                        </button>
                        <button onClick={handleClearForm} className="w-full sm:w-auto flex-1 px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105">
                            Limpiar Formularios
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Bitacora;
