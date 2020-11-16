module.exports = {
	devServer: {
		proxy: {
			'/mmp': {
				target: '192.168.0.154:8982', //对应自己的接口
				changeOrigin: true,
			}
		},
	},
}
