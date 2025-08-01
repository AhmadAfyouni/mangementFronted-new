export interface SectionType {
  _id: string;
  name: string;
  department: string;
  type_section?: "BY_ME" | "FOR_ME"; // Section type
}
