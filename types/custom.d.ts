declare module "jspdf-autotable" {
    import jsPDF from "jspdf";
    declare global {
      interface jsPDF {
        autoTable: any;
      }
    }
  }
  