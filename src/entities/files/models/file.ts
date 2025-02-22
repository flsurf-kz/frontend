export interface FileEntity {
    id: string;
    fileName: string;
    filePath: string;
    mimeType?: string; // Опциональное поле
    size: number;
}