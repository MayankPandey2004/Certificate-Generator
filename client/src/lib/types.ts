export type Template = "classic" | "modern" | "elegant" | "minimalist"

export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'badge';
  content?: string | null;
  x: number;
  y: number;
  width: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'light';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: 'default' | 'script' | 'serif' | 'sans';
  imageUrl?: string | null;
  shape?: 'rectangle' | 'circle';
}

export interface Certificate {
  createdAt: string;
  recipientName: string
  title: string
  issuerName: string
  issueDate: string
  signature: string
  signatureTitle: string
  backgroundColor: string
  textColor: string
  accentColor: string
  backgroundImage: string | null
  template: Template
  fontSize: number
  elements: CertificateElement[]
}

