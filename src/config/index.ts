const envBaseUrl = import.meta.env.VITE_APP_BASE_URL || "";

let baseUrl = `${envBaseUrl}/`;

const config = {
    version: "1.9.0", //版本号
    baseUrl, //请求接口域名
    urlPrefix: "api", //请求默认前缀
    timeout: 60 * 1000, //请求超时时长
};

export default config;
