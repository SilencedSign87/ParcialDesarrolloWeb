import type { Exam } from '../types'

export function seedExams() {
  const existing = localStorage.getItem('exams')
  if (existing && JSON.parse(existing).length > 0) return

  const exams: Exam[] = [
    {
      id: 'exam-001',
      title: 'Fundamentos de Redes',
      area: 'Redes',
      type: 'multiple',
      minPassPercentage: 70,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
      questions: [
        { id: 'q1', text: '¿Qué significa IP?', type: 'multiple', options: ['Internet Protocol', 'Internal Process', 'Input Port', 'Indexed Page'], correctAnswer: 0 },
        { id: 'q2', text: '¿Cuántos bits tiene una dirección IPv4?', type: 'multiple', options: ['16', '32', '64', '128'], correctAnswer: 1 },
        { id: 'q3', text: '¿Qué capa del modelo OSI maneja el enrutamiento?', type: 'multiple', options: ['Física', 'Enlace', 'Red', 'Transporte'], correctAnswer: 2 },
        { id: 'q4', text: '¿Qué protocolo se usa para asignar IPs automáticamente?', type: 'multiple', options: ['FTP', 'DHCP', 'DNS', 'HTTP'], correctAnswer: 1 },
        { id: 'q5', text: '¿Cuál es el puerto por defecto de HTTPS?', type: 'multiple', options: ['80', '21', '443', '22'], correctAnswer: 2 },
      ],
    },
    {
      id: 'exam-002',
      title: 'Programación en Python',
      area: 'Programación',
      type: 'multiple',
      minPassPercentage: 60,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
      questions: [
        { id: 'q1', text: '¿Cómo se define una función en Python?', type: 'multiple', options: ['function nombre():', 'def nombre():', 'fn nombre():', 'func nombre():'], correctAnswer: 1 },
        { id: 'q2', text: '¿Qué tipo de dato retorna len("hola")?', type: 'multiple', options: ['str', 'float', 'int', 'bool'], correctAnswer: 2 },
        { id: 'q3', text: '¿Cuál es el resultado de 3 ** 2 en Python?', type: 'multiple', options: ['6', '9', '8', '5'], correctAnswer: 1 },
        { id: 'q4', text: '¿Qué palabra clave se usa para herencia en Python?', type: 'multiple', options: ['extends', 'implements', 'inherits', 'class Hijo(Padre)'], correctAnswer: 3 },
      ],
    },
  ]

  localStorage.setItem('exams', JSON.stringify(exams))
}
