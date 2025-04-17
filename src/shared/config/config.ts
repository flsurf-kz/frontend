export const GlobalConfig = {
	apiUrl: import.meta.env.PUBLIC_API_URL,
	appName: import.meta.env.PUBLIC_APP_NAME, 
    baseFilesUrl: import.meta.env.PUBLIC_BASE_FILES_URL ?? "localhost:8000/api/files/download/"
};