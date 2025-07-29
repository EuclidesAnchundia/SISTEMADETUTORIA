"use client";

import { createContext, useContext, type ReactNode, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: "estudiante" | "tutor" | "coordinador" | "administrador";
  facultad?: string;
  carrera?: string;
  especialidad?: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
  fechaRegistro: string;
}

interface Tutoria {
  id: string;
  estudianteEmail: string;
  tutorEmail: string;
  fecha: string;
  hora: string;
  asunto: string;
  descripcion: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "completada";
  observaciones?: string;
  calificacion?: string;
  fechaCreacion: string;
  fechaSolicitud: string;
}

interface Tema {
  id: string;
  estudianteEmail: string;
  titulo: string;
  descripcion: string;
  aprobado: boolean;
  observaciones?: string;
  comentarios?: string;
  fechaRegistro: string;
  fechaRevision?: string;
}

interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  contenido: string;
  url?: string;
  estudianteEmail: string;
  fechaSubida: string;
}

interface Asignacion {
  id: string;
  estudianteId?: string;
  tutorId?: string;
  estudianteEmail?: string;
  tutorEmail?: string;
  coordinadorEmail?: string;
  fechaAsignacion: string;
}

interface Notificacion {
  id: string;
  usuarioEmail: string;
  tipo: string;
  mensaje: string;
  datos?: any;
  leida: boolean;
  fecha: string;
}

interface SystemContextType {
  // Usuarios
  users: User[];
  usuarios: User[];
  saveUser: (user: User) => boolean;
  createUser: (user: User) => boolean;
  updateUser: (email: string, updates: Partial<User>) => boolean;
  deleteUser: (email: string) => boolean;
  getUserByEmail: (email: string) => User | undefined;
  getAllUsers: () => User[];
  validateCredentials: (email: string, password: string) => boolean;
  validateEmailDomain: (email: string) => string | null;

  // Tutorías
  tutorias: Tutoria[];
  saveTutoria: (tutoria: Tutoria) => boolean;
  createTutoria: (tutoria: Omit<Tutoria, "id" | "fechaCreacion">) => boolean;
  updateTutoria: (id: string, updates: Partial<Tutoria>) => boolean;
  deleteTutoria: (id: string) => boolean;
  getTutoriasByStudent: (email: string) => Tutoria[];
  getTutoriasByTutor: (email: string) => Tutoria[];
  getAllTutorias: () => Tutoria[];

  // Temas
  temas: Tema[];
  saveTema: (tema: Tema) => boolean;
  createTema: (tema: Omit<Tema, "id" | "fechaRegistro">) => boolean;
  updateTema: (id: string, updates: Partial<Tema>) => boolean;
  deleteTema: (id: string) => boolean;
  getTemaByStudent: (email: string) => Tema | undefined;
  getThemeByStudent: (email: string) => Tema | undefined;
  getAllTemas: () => Tema[];

  // Archivos
  archivos: Archivo[];
  saveArchivo: (archivo: Archivo) => boolean;
  createArchivo: (archivo: Omit<Archivo, "id" | "fechaSubida">) => boolean;
  deleteArchivo: (id: string) => boolean;
  getArchivosByStudent: (email: string) => Archivo[];
  getFilesByStudent: (email: string) => Archivo[];
  getAllArchivos: () => Archivo[];

  // Asignaciones
  asignaciones: Asignacion[];
  saveAsignacion: (asignacion: Asignacion) => boolean;
  deleteAsignacion: (id: string) => boolean;
  assignTutorToStudent: (studentId: string, tutorId: string) => boolean;
  removeAssignment: (studentId: string) => boolean;
  getAssignmentByStudent: (studentId: string) => Asignacion | undefined;
  getAssignmentsByTutor: (tutorId: string) => Asignacion[];
  getAllAssignments: () => Asignacion[];
  getAssignedTutor: (studentEmail: string) => User | undefined;
  getAssignedStudents: (tutorEmail: string) => User[];

  // Notificaciones
  notificaciones: Notificacion[];
  createNotification: (
    userEmail: string,
    tipo: string,
    mensaje: string,
    datos?: any,
  ) => void;
  getNotifications: (userEmail: string) => Notificacion[];
  markAsRead: (id: string) => void;
  markAllAsRead: (userEmail: string) => void;
  getAllNotifications: () => Notificacion[];

  // Utilidades
  generateId: () => string;
  formatDate: (date: string) => string;
  resetSystem: () => void;
  getSystemStats: () => any;
  forceCreateDefaultUsers: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useLocalStorage<User[]>("usuarios", []);
  const [tutorias, setTutorias] = useLocalStorage<Tutoria[]>("tutorias", []);
  const [temas, setTemas] = useLocalStorage<Tema[]>("temas", []);
  const [archivos, setArchivos] = useLocalStorage<Archivo[]>("archivos", []);
  const [asignaciones, setAsignaciones] = useLocalStorage<Asignacion[]>(
    "asignaciones",
    [],
  );
  const [notificaciones, setNotificaciones] = useLocalStorage<Notificacion[]>(
    "notificaciones",
    [],
  );

  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);

  const validateEmailDomain = (email: string): string | null => {
    const domains = {
      estudiante: "@live.uleam.edu.ec",
      tutor: "@uleam.edu.ec",
      coordinador: "@coordtit.uleam.edu.ec",
      administrador: "@admin.uleam.edu.ec",
    };

    for (const [rol, dominio] of Object.entries(domains)) {
      if (email.endsWith(dominio)) {
        return rol;
      }
    }
    return null;
  };

  const saveUser = (user: User): boolean => {
    const existingIndex = usuarios.findIndex((u) => u.email === user.email);
    if (existingIndex >= 0) {
      setUsuarios((prev) =>
        prev.map((u, index) => (index === existingIndex ? user : u)),
      );
    } else {
      setUsuarios((prev) => [...prev, user]);
    }
    return true;
  };

  const createUser = (user: User): boolean => {
    if (usuarios.find((u) => u.email === user.email)) {
      return false; // User already exists
    }
    setUsuarios((prev) => [...prev, user]);
    return true;
  };

  const updateUser = (email: string, updates: Partial<User>): boolean => {
    setUsuarios((prev) =>
      prev.map((user) =>
        user.email === email ? { ...user, ...updates } : user,
      ),
    );
    return true;
  };

  const deleteUser = (email: string): boolean => {
    setUsuarios((prev) => prev.filter((user) => user.email !== email));
    // Also remove related data
    setTutorias((prev) =>
      prev.filter((t) => t.estudianteEmail !== email && t.tutorEmail !== email),
    );
    setTemas((prev) => prev.filter((t) => t.estudianteEmail !== email));
    setArchivos((prev) => prev.filter((a) => a.estudianteEmail !== email));
    const userToDelete = usuarios.find((u) => u.email === email);
    if (userToDelete) {
      setAsignaciones((prev) =>
        prev.filter(
          (a) =>
            a.estudianteId !== userToDelete.id && a.tutorId !== userToDelete.id,
        ),
      );
    }
    return true;
  };

  const getUserByEmail = (email: string) =>
    usuarios.find((u) => u.email === email);

  const getAllUsers = () => usuarios;

  const validateCredentials = (email: string, password: string): boolean => {
    const user = getUserByEmail(email);
    return user ? user.password === password : false;
  };

  const saveTutoria = (tutoria: Tutoria): boolean => {
    const existingIndex = tutorias.findIndex((t) => t.id === tutoria.id);
    if (existingIndex >= 0) {
      setTutorias((prev) =>
        prev.map((t, index) => (index === existingIndex ? tutoria : t)),
      );
    } else {
      setTutorias((prev) => [...prev, tutoria]);
    }
    return true;
  };

  const createTutoria = (
    tutoria: Omit<Tutoria, "id" | "fechaCreacion">,
  ): boolean => {
    const newTutoria: Tutoria = {
      ...tutoria,
      id: generateId(),
      fechaCreacion: new Date().toISOString(),
    };
    setTutorias((prev) => [...prev, newTutoria]);
    createNotification(
      tutoria.tutorEmail,
      "NUEVA_SOLICITUD",
      `Nueva solicitud de tutoría: ${tutoria.asunto}`,
    );
    return true;
  };

  const updateTutoria = (id: string, updates: Partial<Tutoria>): boolean => {
    setTutorias((prev) =>
      prev.map((tutoria) =>
        tutoria.id === id ? { ...tutoria, ...updates } : tutoria,
      ),
    );
    return true;
  };

  const deleteTutoria = (id: string): boolean => {
    setTutorias((prev) => prev.filter((tutoria) => tutoria.id !== id));
    return true;
  };

  const getTutoriasByStudent = (email: string) =>
    tutorias.filter((t) => t.estudianteEmail === email);

  const getTutoriasByTutor = (email: string) =>
    tutorias.filter((t) => t.tutorEmail === email);

  const getAllTutorias = () => tutorias;

  const saveTema = (tema: Tema): boolean => {
    const existingIndex = temas.findIndex((t) => t.id === tema.id);
    if (existingIndex >= 0) {
      setTemas((prev) =>
        prev.map((t, index) => (index === existingIndex ? tema : t)),
      );
    } else {
      setTemas((prev) => [...prev, tema]);
    }
    return true;
  };

  const createTema = (tema: Omit<Tema, "id" | "fechaRegistro">): boolean => {
    const newTema: Tema = {
      ...tema,
      id: generateId(),
      fechaRegistro: new Date().toISOString(),
    };
    setTemas((prev) => [...prev, newTema]);
    return true;
  };

  const updateTema = (id: string, updates: Partial<Tema>): boolean => {
    setTemas((prev) =>
      prev.map((tema) => (tema.id === id ? { ...tema, ...updates } : tema)),
    );
    return true;
  };

  const deleteTema = (id: string): boolean => {
    setTemas((prev) => prev.filter((tema) => tema.id !== id));
    return true;
  };

  const getTemaByStudent = (email: string) =>
    temas.find((t) => t.estudianteEmail === email);

  const getAllTemas = () => temas;

  const saveArchivo = (archivo: Archivo): boolean => {
    const existingIndex = archivos.findIndex((a) => a.id === archivo.id);
    if (existingIndex >= 0) {
      setArchivos((prev) =>
        prev.map((a, index) => (index === existingIndex ? archivo : a)),
      );
    } else {
      setArchivos((prev) => [...prev, archivo]);
    }
    return true;
  };

  const createArchivo = (
    archivo: Omit<Archivo, "id" | "fechaSubida">,
  ): boolean => {
    const newArchivo: Archivo = {
      ...archivo,
      id: generateId(),
      fechaSubida: new Date().toISOString(),
    };
    setArchivos((prev) => [...prev, newArchivo]);
    const tutor = getAssignedTutor(archivo.estudianteEmail);
    if (tutor) {
      createNotification(
        tutor.email,
        "ARCHIVO_SUBIDO",
        `El estudiante ha subido un nuevo archivo: ${archivo.nombre}`,
      );
    }
    return true;
  };

  const deleteArchivo = (id: string): boolean => {
    setArchivos((prev) => prev.filter((a) => a.id !== id));
    return true;
  };

  const getArchivosByStudent = (email: string) =>
    archivos.filter((a) => a.estudianteEmail === email);

  const getFilesByStudent = (email: string) =>
    archivos.filter((a) => a.estudianteEmail === email);

  const getAllArchivos = () => archivos;

  const saveAsignacion = (asignacion: Asignacion): boolean => {
    const existingIndex = asignaciones.findIndex((a) => a.id === asignacion.id);
    if (existingIndex >= 0) {
      setAsignaciones((prev) =>
        prev.map((a, index) => (index === existingIndex ? asignacion : a)),
      );
    } else {
      setAsignaciones((prev) => [...prev, asignacion]);
    }
    return true;
  };

  const deleteAsignacion = (id: string): boolean => {
    setAsignaciones((prev) => prev.filter((a) => a.id !== id));
    return true;
  };

  const assignTutorToStudent = (
    studentId: string,
    tutorId: string,
  ): boolean => {
    // Remove existing assignment if any
    setAsignaciones((prev) => prev.filter((a) => a.estudianteId !== studentId));

    // Add new assignment
    const newAssignment: Asignacion = {
      id: generateId(),
      estudianteId: studentId,
      tutorId: tutorId,
      fechaAsignacion: new Date().toISOString(),
    };
    setAsignaciones((prev) => [...prev, newAssignment]);
    return true;
  };

  const removeAssignment = (studentId: string): boolean => {
    setAsignaciones((prev) => prev.filter((a) => a.estudianteId !== studentId));
    return true;
  };

  const getAssignmentByStudent = (
    studentId: string,
  ): Asignacion | undefined => {
    return asignaciones.find((a) => a.estudianteId === studentId);
  };

  const getAssignmentsByTutor = (tutorId: string): Asignacion[] => {
    return asignaciones.filter((a) => a.tutorId === tutorId);
  };

  const getAllAssignments = () => asignaciones;

  const getAssignedTutor = (studentEmail: string): User | undefined => {
    // First find the student by email to get their ID
    const student = usuarios.find((u) => u.email === studentEmail);
    if (!student) return undefined;

    // Then find the assignment using the student ID
    const asignacion = asignaciones.find((a) => a.estudianteId === student.id);
    if (!asignacion) return undefined;

    // Finally find the tutor by ID
    return usuarios.find((u) => u.id === asignacion.tutorId);
  };

  const getAssignedStudents = (tutorEmail: string): User[] => {
    const tutor = usuarios.find((u) => u.email === tutorEmail);
    if (!tutor) return [];

    const tutorAsignaciones = asignaciones.filter(
      (a) => a.tutorId === tutor.id,
    );
    return tutorAsignaciones
      .map((a) => usuarios.find((u) => u.id === a.estudianteId))
      .filter(Boolean) as User[];
  };

  const createNotification = (
    userEmail: string,
    tipo: string,
    mensaje: string,
    datos?: any,
  ) => {
    const notification: Notificacion = {
      id: generateId(),
      usuarioEmail: userEmail,
      tipo,
      mensaje,
      datos,
      leida: false,
      fecha: new Date().toISOString(),
    };
    setNotificaciones((prev) => [...prev, notification]);
  };

  const getNotifications = (userEmail: string) =>
    notificaciones.filter((n) => n.usuarioEmail === userEmail);

  const getAllNotifications = () => notificaciones;

  const markAsRead = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    );
  };

  const markAllAsRead = (userEmail: string) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.usuarioEmail === userEmail ? { ...n, leida: true } : n,
      ),
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resetSystem = () => {
    setUsuarios([]);
    setTutorias([]);
    setTemas([]);
    setArchivos([]);
    setAsignaciones([]);
    setNotificaciones([]);
  };

  const getSystemStats = () => {
    return {
      totalUsers: usuarios.length,
      totalStudents: usuarios.filter((u) => u.rol === "estudiante").length,
      totalTutors: usuarios.filter((u) => u.rol === "tutor").length,
      totalCoordinators: usuarios.filter((u) => u.rol === "coordinador").length,
      totalTutorias: tutorias.length,
      completedTutorias: tutorias.filter((t) => t.estado === "completada")
        .length,
      totalThemes: temas.length,
      totalFiles: archivos.length,
      facultiesActivity: usuarios.reduce(
        (acc, user) => {
          if (user.facultad) {
            acc[user.facultad] = (acc[user.facultad] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  };

  // Crear datos de ejemplo si no existen
  useEffect(() => {
    if (usuarios.length === 0) {
      const defaultUsers = [
        // Estudiantes
        {
          id: "student1",
          nombres: "María",
          apellidos: "González",
          email: "maria.gonzalez@live.uleam.edu.ec",
          password: "estudiante123",
          rol: "estudiante" as const,
          facultad: "Facultad de Ingeniería, Industria y Arquitectura",
          carrera: "Ingeniería en Sistemas",
          preguntaSeguridad: "mascota",
          respuestaSeguridad: "firulais",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "student2",
          nombres: "Juan",
          apellidos: "Pérez",
          email: "juan.perez@live.uleam.edu.ec",
          password: "estudiante123",
          rol: "estudiante" as const,
          facultad: "Facultad de Ingeniería, Industria y Arquitectura",
          carrera: "Ingeniería Civil",
          preguntaSeguridad: "ciudad",
          respuestaSeguridad: "portoviejo",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "student3",
          nombres: "Ana",
          apellidos: "López",
          email: "ana.lopez@live.uleam.edu.ec",
          password: "estudiante123",
          rol: "estudiante" as const,
          facultad: "Facultad de Ciencias de la Salud",
          carrera: "Medicina General",
          preguntaSeguridad: "escuela",
          respuestaSeguridad: "san jose",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "student4",
          nombres: "Carlos",
          apellidos: "Mendoza",
          email: "carlos.mendoza@live.uleam.edu.ec",
          password: "estudiante123",
          rol: "estudiante" as const,
          facultad:
            "Facultad de Ciencias Administrativas, Contables y Comerciales",
          carrera: "Administración de Empresas",
          preguntaSeguridad: "mascota",
          respuestaSeguridad: "max",
          fechaRegistro: new Date().toISOString(),
        },
        // Tutores
        {
          id: "tutor1",
          nombres: "Dr. Carlos",
          apellidos: "Rodríguez",
          email: "carlos.rodriguez@uleam.edu.ec",
          password: "tutor123",
          rol: "tutor" as const,
          facultad: "Facultad de Ingeniería, Industria y Arquitectura",
          especialidad: "Desarrollo de Software",
          preguntaSeguridad: "ciudad",
          respuestaSeguridad: "manta",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "tutor2",
          nombres: "Dra. Patricia",
          apellidos: "Silva",
          email: "patricia.silva@uleam.edu.ec",
          password: "tutor123",
          rol: "tutor" as const,
          facultad: "Facultad de Ingeniería, Industria y Arquitectura",
          especialidad: "Ingeniería Civil",
          preguntaSeguridad: "escuela",
          respuestaSeguridad: "uleam",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "tutor3",
          nombres: "Dr. Roberto",
          apellidos: "Vásquez",
          email: "roberto.vasquez@uleam.edu.ec",
          password: "tutor123",
          rol: "tutor" as const,
          facultad: "Facultad de Ciencias de la Salud",
          especialidad: "Medicina Interna",
          preguntaSeguridad: "mascota",
          respuestaSeguridad: "toby",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "tutor4",
          nombres: "Mg. Laura",
          apellidos: "Morales",
          email: "laura.morales@uleam.edu.ec",
          password: "tutor123",
          rol: "tutor" as const,
          facultad:
            "Facultad de Ciencias Administrativas, Contables y Comerciales",
          especialidad: "Gestión Empresarial",
          preguntaSeguridad: "ciudad",
          respuestaSeguridad: "chone",
          fechaRegistro: new Date().toISOString(),
        },
        // Coordinadores
        {
          id: "coord1",
          nombres: "Dra. Ana",
          apellidos: "Martínez",
          email: "ana.martinez@coordtit.uleam.edu.ec",
          password: "coordinador123",
          rol: "coordinador" as const,
          facultad: "Facultad de Ingeniería, Industria y Arquitectura",
          preguntaSeguridad: "escuela",
          respuestaSeguridad: "uleam",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "coord2",
          nombres: "Dr. Miguel",
          apellidos: "Torres",
          email: "miguel.torres@coordtit.uleam.edu.ec",
          password: "coordinador123",
          rol: "coordinador" as const,
          facultad: "Facultad de Ciencias de la Salud",
          preguntaSeguridad: "mascota",
          respuestaSeguridad: "luna",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "coord3",
          nombres: "Mg. Sandra",
          apellidos: "Ramírez",
          email: "sandra.ramirez@coordtit.uleam.edu.ec",
          password: "coordinador123",
          rol: "coordinador" as const,
          facultad:
            "Facultad de Ciencias Administrativas, Contables y Comerciales",
          preguntaSeguridad: "ciudad",
          respuestaSeguridad: "bahia",
          fechaRegistro: new Date().toISOString(),
        },
        // Administradores
        {
          id: "admin1",
          nombres: "Admin",
          apellidos: "Sistema",
          email: "admin@admin.uleam.edu.ec",
          password: "admin123",
          rol: "administrador" as const,
          facultad:
            "Facultad de Ciencias Administrativas, Contables y Comerciales",
          preguntaSeguridad: "mascota",
          respuestaSeguridad: "admin",
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: "admin2",
          nombres: "Super",
          apellidos: "Admin",
          email: "superadmin@admin.uleam.edu.ec",
          password: "admin123",
          rol: "administrador" as const,
          facultad: "Sistemas",
          preguntaSeguridad: "escuela",
          respuestaSeguridad: "uleam",
          fechaRegistro: new Date().toISOString(),
        },
      ];

      setUsuarios(defaultUsers);

      // Crear temas de ejemplo
      const defaultTemas = [
        {
          id: generateId(),
          estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
          titulo: "Sistema Web para Gestión de Inventarios",
          descripcion:
            "Desarrollo de una aplicación web para el control y gestión de inventarios en pequeñas y medianas empresas, utilizando tecnologías modernas como React y Node.js.",
          fechaRegistro: new Date().toISOString(),
          aprobado: true,
        },
        {
          id: generateId(),
          estudianteEmail: "juan.perez@live.uleam.edu.ec",
          titulo: "Análisis Estructural de Puentes Colgantes",
          descripcion:
            "Estudio del comportamiento estructural de puentes colgantes bajo diferentes cargas y condiciones climáticas, aplicando métodos de elementos finitos.",
          fechaRegistro: new Date().toISOString(),
          aprobado: false,
        },
        {
          id: generateId(),
          estudianteEmail: "ana.lopez@live.uleam.edu.ec",
          titulo: "Prevalencia de Diabetes en Adultos Mayores",
          descripcion:
            "Investigación epidemiológica sobre la prevalencia de diabetes tipo 2 en adultos mayores de 65 años en la provincia de Manabí.",
          fechaRegistro: new Date().toISOString(),
          aprobado: true,
        },
      ];

      setTemas(defaultTemas);

      // Crear asignaciones de ejemplo
      const defaultAsignaciones = [
        {
          id: generateId(),
          estudianteId: "student1",
          tutorId: "tutor1",
          fechaAsignacion: new Date().toISOString(),
        },
        {
          id: generateId(),
          estudianteId: "student2",
          tutorId: "tutor2",
          fechaAsignacion: new Date().toISOString(),
        },
        {
          id: generateId(),
          estudianteId: "student3",
          tutorId: "tutor3",
          fechaAsignacion: new Date().toISOString(),
        },
      ];

      setAsignaciones(defaultAsignaciones);

      // Crear tutorías de ejemplo
      const defaultTutorias = [
        {
          id: generateId(),
          estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
          tutorEmail: "carlos.rodriguez@uleam.edu.ec",
          fecha: "2024-02-15",
          hora: "10:00",
          asunto: "Revisión del Marco Teórico",
          descripcion:
            "Revisión y corrección del marco teórico del proyecto de titulación",
          estado: "completada" as const,
          fechaCreacion: new Date().toISOString(),
          fechaSolicitud: new Date().toISOString(),
          observaciones: "Excelente trabajo en la investigación bibliográfica",
          calificacion: "Excelente",
        },
        {
          id: generateId(),
          estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
          tutorEmail: "carlos.rodriguez@uleam.edu.ec",
          fecha: "2024-02-20",
          hora: "14:00",
          asunto: "Desarrollo del Prototipo",
          descripcion: "Revisión del avance en el desarrollo del sistema web",
          estado: "aceptada" as const,
          fechaCreacion: new Date().toISOString(),
          fechaSolicitud: new Date().toISOString(),
        },
        {
          id: generateId(),
          estudianteEmail: "juan.perez@live.uleam.edu.ec",
          tutorEmail: "patricia.silva@uleam.edu.ec",
          fecha: "2024-02-18",
          hora: "09:00",
          asunto: "Metodología de Investigación",
          descripcion:
            "Definición de la metodología para el análisis estructural",
          estado: "pendiente" as const,
          fechaCreacion: new Date().toISOString(),
          fechaSolicitud: new Date().toISOString(),
        },
        {
          id: generateId(),
          estudianteEmail: "ana.lopez@live.uleam.edu.ec",
          tutorEmail: "roberto.vasquez@uleam.edu.ec",
          fecha: "2024-02-12",
          hora: "11:00",
          asunto: "Diseño de la Investigación",
          descripcion: "Planificación del estudio epidemiológico",
          estado: "completada" as const,
          fechaCreacion: new Date().toISOString(),
          fechaSolicitud: new Date().toISOString(),
          observaciones: "Muy buen planteamiento metodológico",
          calificacion: "Muy Bueno",
        },
      ];

      setTutorias(defaultTutorias);

      // Crear archivos de ejemplo
      const defaultArchivos = [
        {
          id: generateId(),
          nombre: "Marco_Teorico_v1.pdf",
          tipo: "application/pdf",
          tamaño: 2048000,
          contenido:
            "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKE1hcmNvIFRlb3JpY28pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTYKJSVFT0Y=",
          estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
          fechaSubida: new Date().toISOString(),
        },
        {
          id: generateId(),
          nombre: "Capitulo1_Introduccion.pdf",
          tipo: "application/pdf",
          tamaño: 1536000,
          contenido:
            "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKEludHJvZHVjY2lvbikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMyNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxNgolJUVPRg==",
          estudianteEmail: "juan.perez@live.uleam.edu.ec",
          fechaSubida: new Date().toISOString(),
        },
        {
          id: generateId(),
          nombre: "Metodologia_Investigacion.pdf",
          tipo: "application/pdf",
          tamaño: 3072000,
          contenido:
            "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKE1ldG9kb2xvZ2lhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzI0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE2CiUlRU9G",
          estudianteEmail: "ana.lopez@live.uleam.edu.ec",
          fechaSubida: new Date().toISOString(),
        },
      ];

      setArchivos(defaultArchivos);

      // Crear notificaciones de ejemplo
      const defaultNotificaciones = [
        {
          id: generateId(),
          usuarioEmail: "maria.gonzalez@live.uleam.edu.ec",
          tipo: "TUTORIA_COMPLETADA",
          mensaje: "Tu tutoría 'Revisión del Marco Teórico' ha sido completada",
          leida: false,
          fecha: new Date().toISOString(),
        },
        {
          id: generateId(),
          usuarioEmail: "maria.gonzalez@live.uleam.edu.ec",
          tipo: "TUTORIA_ACEPTADA",
          mensaje: "Tu tutoría 'Desarrollo del Prototipo' ha sido aceptada",
          leida: true,
          fecha: new Date().toISOString(),
        },
        {
          id: generateId(),
          usuarioEmail: "carlos.rodriguez@uleam.edu.ec",
          tipo: "NUEVA_SOLICITUD",
          mensaje: "Nueva solicitud de tutoría: Desarrollo del Prototipo",
          leida: false,
          fecha: new Date().toISOString(),
        },
        {
          id: generateId(),
          usuarioEmail: "juan.perez@live.uleam.edu.ec",
          tipo: "TUTOR_ASIGNADO",
          mensaje: "Se te ha asignado un tutor para tu proceso de titulación",
          leida: true,
          fecha: new Date().toISOString(),
        },
      ];

      setNotificaciones(defaultNotificaciones);
    }
  }, [usuarios.length]);

  const forceCreateDefaultUsers = () => {
    // Limpiar todos los datos primero
    setUsuarios([]);
    setTutorias([]);
    setTemas([]);
    setArchivos([]);
    setAsignaciones([]);
    setNotificaciones([]);

    // Recrear todos los datos de ejemplo
    const defaultUsers = [
      // Estudiantes
      {
        id: "student1",
        nombres: "María",
        apellidos: "González",
        email: "maria.gonzalez@live.uleam.edu.ec",
        password: "estudiante123",
        rol: "estudiante" as const,
        facultad: "Facultad de Ingeniería, Industria y Arquitectura",
        carrera: "Ingeniería en Sistemas",
        preguntaSeguridad: "mascota",
        respuestaSeguridad: "firulais",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "student2",
        nombres: "Juan",
        apellidos: "Pérez",
        email: "juan.perez@live.uleam.edu.ec",
        password: "estudiante123",
        rol: "estudiante" as const,
        facultad: "Facultad de Ingeniería, Industria y Arquitectura",
        carrera: "Ingeniería Civil",
        preguntaSeguridad: "ciudad",
        respuestaSeguridad: "portoviejo",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "student3",
        nombres: "Ana",
        apellidos: "López",
        email: "ana.lopez@live.uleam.edu.ec",
        password: "estudiante123",
        rol: "estudiante" as const,
        facultad: "Facultad de Ciencias de la Salud",
        carrera: "Medicina General",
        preguntaSeguridad: "escuela",
        respuestaSeguridad: "san jose",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "student4",
        nombres: "Carlos",
        apellidos: "Mendoza",
        email: "carlos.mendoza@live.uleam.edu.ec",
        password: "estudiante123",
        rol: "estudiante" as const,
        facultad:
          "Facultad de Ciencias Administrativas, Contables y Comerciales",
        carrera: "Administración de Empresas",
        preguntaSeguridad: "mascota",
        respuestaSeguridad: "max",
        fechaRegistro: new Date().toISOString(),
      },
      // Tutores
      {
        id: "tutor1",
        nombres: "Dr. Carlos",
        apellidos: "Rodríguez",
        email: "carlos.rodriguez@uleam.edu.ec",
        password: "tutor123",
        rol: "tutor" as const,
        facultad: "Facultad de Ingeniería, Industria y Arquitectura",
        especialidad: "Desarrollo de Software",
        preguntaSeguridad: "ciudad",
        respuestaSeguridad: "manta",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "tutor2",
        nombres: "Dra. Patricia",
        apellidos: "Silva",
        email: "patricia.silva@uleam.edu.ec",
        password: "tutor123",
        rol: "tutor" as const,
        facultad: "Facultad de Ingeniería, Industria y Arquitectura",
        especialidad: "Ingeniería Civil",
        preguntaSeguridad: "escuela",
        respuestaSeguridad: "uleam",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "tutor3",
        nombres: "Dr. Roberto",
        apellidos: "Vásquez",
        email: "roberto.vasquez@uleam.edu.ec",
        password: "tutor123",
        rol: "tutor" as const,
        facultad: "Facultad de Ciencias de la Salud",
        especialidad: "Medicina Interna",
        preguntaSeguridad: "mascota",
        respuestaSeguridad: "toby",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "tutor4",
        nombres: "Mg. Laura",
        apellidos: "Morales",
        email: "laura.morales@uleam.edu.ec",
        password: "tutor123",
        rol: "tutor" as const,
        facultad:
          "Facultad de Ciencias Administrativas, Contables y Comerciales",
        especialidad: "Gestión Empresarial",
        preguntaSeguridad: "ciudad",
        respuestaSeguridad: "chone",
        fechaRegistro: new Date().toISOString(),
      },
      // Coordinadores
      {
        id: "coord1",
        nombres: "Dra. Ana",
        apellidos: "Martínez",
        email: "ana.martinez@coordtit.uleam.edu.ec",
        password: "coordinador123",
        rol: "coordinador" as const,
        facultad: "Facultad de Ingeniería, Industria y Arquitectura",
        preguntaSeguridad: "escuela",
        respuestaSeguridad: "uleam",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "coord2",
        nombres: "Dr. Miguel",
        apellidos: "Torres",
        email: "miguel.torres@coordtit.uleam.edu.ec",
        password: "coordinador123",
        rol: "coordinador" as const,
        facultad: "Facultad de Ciencias de la Salud",
        preguntaSeguridad: "mascota",
        respuestaSeguridad: "luna",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "coord3",
        nombres: "Mg. Sandra",
        apellidos: "Ramírez",
        email: "sandra.ramirez@coordtit.uleam.edu.ec",
        password: "coordinador123",
        rol: "coordinador" as const,
        facultad:
          "Facultad de Ciencias Administrativas, Contables y Comerciales",
        preguntaSeguridad: "ciudad",
        respuestaSeguridad: "bahia",
        fechaRegistro: new Date().toISOString(),
      },
      // Administradores
      {
        id: "admin1",
        nombres: "Admin",
        apellidos: "Sistema",
        email: "admin@admin.uleam.edu.ec",
        password: "admin123",
        rol: "administrador" as const,
        facultad:
          "Facultad de Ciencias Administrativas, Contables y Comerciales",
        preguntaSeguridad: "mascota",
        respuestaSeguridad: "admin",
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: "admin2",
        nombres: "Super",
        apellidos: "Admin",
        email: "superadmin@admin.uleam.edu.ec",
        password: "admin123",
        rol: "administrador" as const,
        facultad: "Sistemas",
        preguntaSeguridad: "escuela",
        respuestaSeguridad: "uleam",
        fechaRegistro: new Date().toISOString(),
      },
    ];

    setUsuarios(defaultUsers);

    // Crear temas de ejemplo
    const defaultTemas = [
      {
        id: generateId(),
        estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
        titulo: "Sistema Web para Gestión de Inventarios",
        descripcion:
          "Desarrollo de una aplicación web para el control y gestión de inventarios en pequeñas y medianas empresas, utilizando tecnologías modernas como React y Node.js.",
        fechaRegistro: new Date().toISOString(),
        aprobado: true,
      },
      {
        id: generateId(),
        estudianteEmail: "juan.perez@live.uleam.edu.ec",
        titulo: "Análisis Estructural de Puentes Colgantes",
        descripcion:
          "Estudio del comportamiento estructural de puentes colgantes bajo diferentes cargas y condiciones climáticas, aplicando métodos de elementos finitos.",
        fechaRegistro: new Date().toISOString(),
        aprobado: false,
      },
      {
        id: generateId(),
        estudianteEmail: "ana.lopez@live.uleam.edu.ec",
        titulo: "Prevalencia de Diabetes en Adultos Mayores",
        descripcion:
          "Investigación epidemiológica sobre la prevalencia de diabetes tipo 2 en adultos mayores de 65 años en la provincia de Manabí.",
        fechaRegistro: new Date().toISOString(),
        aprobado: true,
      },
    ];

    setTemas(defaultTemas);

    // Crear asignaciones de ejemplo
    const defaultAsignaciones = [
      {
        id: generateId(),
        estudianteId: "student1",
        tutorId: "tutor1",
        fechaAsignacion: new Date().toISOString(),
      },
      {
        id: generateId(),
        estudianteId: "student2",
        tutorId: "tutor2",
        fechaAsignacion: new Date().toISOString(),
      },
      {
        id: generateId(),
        estudianteId: "student3",
        tutorId: "tutor3",
        fechaAsignacion: new Date().toISOString(),
      },
    ];

    setAsignaciones(defaultAsignaciones);

    // Crear tutorías de ejemplo
    const defaultTutorias = [
      {
        id: generateId(),
        estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
        tutorEmail: "carlos.rodriguez@uleam.edu.ec",
        fecha: "2024-02-15",
        hora: "10:00",
        asunto: "Revisión del Marco Teórico",
        descripcion:
          "Revisión y corrección del marco teórico del proyecto de titulación",
        estado: "completada" as const,
        fechaCreacion: new Date().toISOString(),
        fechaSolicitud: new Date().toISOString(),
        observaciones: "Excelente trabajo en la investigación bibliográfica",
        calificacion: "Excelente",
      },
      {
        id: generateId(),
        estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
        tutorEmail: "carlos.rodriguez@uleam.edu.ec",
        fecha: "2024-02-20",
        hora: "14:00",
        asunto: "Desarrollo del Prototipo",
        descripcion: "Revisión del avance en el desarrollo del sistema web",
        estado: "aceptada" as const,
        fechaCreacion: new Date().toISOString(),
        fechaSolicitud: new Date().toISOString(),
      },
      {
        id: generateId(),
        estudianteEmail: "juan.perez@live.uleam.edu.ec",
        tutorEmail: "patricia.silva@uleam.edu.ec",
        fecha: "2024-02-18",
        hora: "09:00",
        asunto: "Metodología de Investigación",
        descripcion:
          "Definición de la metodología para el análisis estructural",
        estado: "pendiente" as const,
        fechaCreacion: new Date().toISOString(),
        fechaSolicitud: new Date().toISOString(),
      },
      {
        id: generateId(),
        estudianteEmail: "ana.lopez@live.uleam.edu.ec",
        tutorEmail: "roberto.vasquez@uleam.edu.ec",
        fecha: "2024-02-12",
        hora: "11:00",
        asunto: "Diseño de la Investigación",
        descripcion: "Planificación del estudio epidemiológico",
        estado: "completada" as const,
        fechaCreacion: new Date().toISOString(),
        fechaSolicitud: new Date().toISOString(),
        observaciones: "Muy buen planteamiento metodológico",
        calificacion: "Muy Bueno",
      },
    ];

    setTutorias(defaultTutorias);

    // Crear archivos de ejemplo
    const defaultArchivos = [
      {
        id: generateId(),
        nombre: "Marco_Teorico_v1.pdf",
        tipo: "application/pdf",
        tamaño: 2048000,
        contenido:
          "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKE1hcmNvIFRlb3JpY28pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTYKJSVFT0Y=",
        estudianteEmail: "maria.gonzalez@live.uleam.edu.ec",
        fechaSubida: new Date().toISOString(),
      },
      {
        id: generateId(),
        nombre: "Capitulo1_Introduccion.pdf",
        tipo: "application/pdf",
        tamaño: 1536000,
        contenido:
          "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKEludHJvZHVjY2lvbikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMyNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxNgolJUVPRg==",
        estudianteEmail: "juan.perez@live.uleam.edu.ec",
        fechaSubida: new Date().toISOString(),
      },
      {
        id: generateId(),
        nombre: "Metodologia_Investigacion.pdf",
        tipo: "application/pdf",
        tamaño: 3072000,
        contenido:
          "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwMCA3MDAgVGQKKE1ldG9kb2xvZ2lhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzI0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE2CiUlRU9G",
        estudianteEmail: "ana.lopez@live.uleam.edu.ec",
        fechaSubida: new Date().toISOString(),
      },
    ];

    setArchivos(defaultArchivos);

    // Crear notificaciones de ejemplo
    const defaultNotificaciones = [
      {
        id: generateId(),
        usuarioEmail: "maria.gonzalez@live.uleam.edu.ec",
        tipo: "TUTORIA_COMPLETADA",
        mensaje: "Tu tutoría 'Revisión del Marco Teórico' ha sido completada",
        leida: false,
        fecha: new Date().toISOString(),
      },
      {
        id: generateId(),
        usuarioEmail: "maria.gonzalez@live.uleam.edu.ec",
        tipo: "TUTORIA_ACEPTADA",
        mensaje: "Tu tutoría 'Desarrollo del Prototipo' ha sido aceptada",
        leida: true,
        fecha: new Date().toISOString(),
      },
      {
        id: generateId(),
        usuarioEmail: "carlos.rodriguez@uleam.edu.ec",
        tipo: "NUEVA_SOLICITUD",
        mensaje: "Nueva solicitud de tutoría: Desarrollo del Prototipo",
        leida: false,
        fecha: new Date().toISOString(),
      },
      {
        id: generateId(),
        usuarioEmail: "juan.perez@live.uleam.edu.ec",
        tipo: "TUTOR_ASIGNADO",
        mensaje: "Se te ha asignado un tutor para tu proceso de titulación",
        leida: true,
        fecha: new Date().toISOString(),
      },
    ];

    setNotificaciones(defaultNotificaciones);
  };

  return (
    <SystemContext.Provider
      value={{
        users: usuarios,
        usuarios,
        saveUser,
        createUser,
        updateUser,
        deleteUser,
        getUserByEmail,
        getAllUsers,
        validateCredentials,
        validateEmailDomain,
        tutorias,
        saveTutoria,
        createTutoria,
        updateTutoria,
        deleteTutoria,
        getTutoriasByStudent,
        getTutoriasByTutor,
        getAllTutorias,
        temas,
        saveTema,
        createTema,
        updateTema,
        deleteTema,
        getTemaByStudent,
        getThemeByStudent: getTemaByStudent,
        getAllTemas,
        archivos,
        saveArchivo,
        createArchivo,
        deleteArchivo,
        getArchivosByStudent,
        getFilesByStudent,
        getAllArchivos,
        asignaciones,
        saveAsignacion,
        deleteAsignacion,
        assignTutorToStudent,
        removeAssignment,
        getAssignmentByStudent,
        getAssignmentsByTutor,
        getAllAssignments,
        getAssignedTutor,
        getAssignedStudents,
        notificaciones,
        createNotification,
        getNotifications,
        markAsRead,
        markAllAsRead,
        getAllNotifications,
        generateId,
        formatDate,
        resetSystem,
        getSystemStats,
        forceCreateDefaultUsers,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
}
