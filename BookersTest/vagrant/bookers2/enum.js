// エラーレベル
// var error_level = function(){
// 	error = 1,
// 	info = 2,
// 	debug = 3
// };

exports.output = function(error_level, message){
	if (error_level == 1){
		console.log(message)
	}else if (error_level == 2){
		console.info(message)
	}else if (error_level == 3){
		console.debug(message)
	}
}