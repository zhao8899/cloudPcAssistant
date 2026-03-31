/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'

    const component: DefineComponent<Record<string, never>, Record<string, never>, any>
    export default component
}

declare module 'uni-router-routes' {
    const routes: any[]
    export default routes
}

declare global {
    interface Window {
        signLink?: string
    }

    interface Uni {
        $u: {
            toast: (message: any) => void
            test?: Record<string, (...args: any[]) => any>
            [key: string]: any
        }
    }

    interface ImportMeta {
        globEager?<T = unknown>(pattern: string): Record<string, T>
    }

    const wx: {
        openAddress?: (...args: any[]) => void
        [key: string]: any
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $theme: {
            primaryColor: string
            pageStyle: Record<string, any>
            navColor: string
            navBgColor: string
            title: string
        }
    }
}

export {}
