import { App } from 'vue'
import pageTitle from './page-title'
import theme from './theme'
export function setupMixin(app: App) {
    app.mixin(theme)
    app.mixin(pageTitle)
}
