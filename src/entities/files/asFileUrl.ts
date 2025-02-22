import { config } from "$lib/shared/config/config";
import type { FileEntity } from "./models/file";

export function asFileUrl(fileUrl: string | null | undefined) { 
    return config.baseFilesUrl + fileUrl
}

export function asFilesBlobOrUrl(file: FileEntity | null | undefined): string {
    if (file === null || file === undefined) { 
        return "" 
    } 
    if (file.blob !== null || file.blob !== "") { 
        return file.blob; 
    }
    return config.baseFilesUrl + file.filePath
}