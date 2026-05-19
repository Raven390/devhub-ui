interface ImportMetaEnv {
    readonly DEV: boolean
    readonly VITE_API_URL: string
    readonly VITE_KEYCLOAK_URL: string
    readonly VITE_KEYCLOAK_REALM: string
    readonly VITE_KEYCLOAK_CLIENT: string
}


interface ImportMeta {
    readonly env: ImportMetaEnv
}
