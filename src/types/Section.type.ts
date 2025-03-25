export interface SectionType {
  _id: string;
  name: "PENDING" | "ONGOING" | "ON_TEST" | "DONE" | string;
  department: string;
}
