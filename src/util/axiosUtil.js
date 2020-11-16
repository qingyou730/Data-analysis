var axiosUtil = {
	generateParams: function(data) { 
		var finalData = {
			app: 'KOP',
			role: this.admin,
			sign: ''
		}
		finalData.data = data;

		return finalData;
	},
	admin: {
		"groups" : "yunying",
	"username" : "lixiaohui",
	"email" : "lixiaohui@game2sky",
	}
}
export default axiosUtil
