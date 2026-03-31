const { spawn } = require('child_process')
const readline = require('readline')

class DevelopClientScript {
    constructor() {
        if (DevelopClientScript.instance) {
            return DevelopClientScript.instance
        }
        DevelopClientScript.instance = this
    }

    promptUser(question) {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            rl.question(question, (res) => {
                resolve(res)
                rl.close()
            })
        })
    }

    async runClient() {
        console.error('请选择要运行的客户端（输入数字后回车）')
        console.error('0.取消')
        console.error('1.桌面安装版前端')
        const runClientRes = await this.promptUser('请输入要运行的客户端：')
        switch (runClientRes) {
            case '0':
                break
            case '1':
                await this.runNpmScript('dev:desktop:web')
                break
            default:
                await this.runClient()
                break
        }
    }

    runNpmScript(scriptName) {
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32'
            const command = isWindows ? 'cmd.exe' : 'npm'
            const args = isWindows
                ? ['/c', 'npm', 'run', scriptName]
                : ['run', scriptName]

            const runProcess = spawn(command, args)

            runProcess.stdout.on('data', (data) => {
                console.log(data.toString())
            })

            runProcess.stderr.on('data', (data) => {
                console.error(data.toString())
            })

            runProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`运行脚本失败: ${scriptName}`))
                } else {
                    resolve()
                }
            })
        })
    }

    async run(targetVersion) {
        const currentVersion = process.versions.node

        if (currentVersion < targetVersion) {
            throw new Error(
                `当前 Node 版本为 ${currentVersion}，需要安装 ${targetVersion} 及以上版本`
            )
        }

        await this.runClient()
    }

    static getInstance() {
        if (!DevelopClientScript.instance) {
            DevelopClientScript.instance = new DevelopClientScript()
        }
        return DevelopClientScript.instance
    }
}

;(async () => {
    const develop = DevelopClientScript.getInstance()
    try {
        await develop.run('18.0.0')
    } catch (error) {
        console.error(error.message)
    }
})()
