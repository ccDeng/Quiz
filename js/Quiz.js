function getJson(JsonName) {
	var client = new XMLHttpRequest();
	client.onload = function() {
		if(client.status >= 200 && client.status <= 304) {
			successHandler();
		} else {
			failureHandler();
		}
	};
	function successHandler() {
		allQuestions = JSON.parse(client.responseText);//全局变量
	};
	function failureHandler() {
		console.error('error');
	};
	client.open('GET', JsonName, true);
	client.send(null);
}
//以上为获取JSON文件解析为JS数组对象

$(document).ready(function() {
	if(getcookie('username') && getcookie('password')) {
		$('#user').val(getcookie('username'));
		$('#password').val(getcookie('password'));
	}
	$('#btnRegister').on('click', register);
	$('#btnLogin').on('click', login);
	$('#go').on('click', next);
	$('#back').on('click', comeBack);
	$('#loggedOut').on('click', loggedOut);
});

//以下为定义函数

//以下为注册验证
function register() {
	var userName = $('#user').val();
	var password = $('#password').val();
	var newUser = { user: userName, pass: password };
	var userJSON = {data:[]};//data键名，值为对象数组
	//输入为空验证
	if(userName == '' || password == '') {
			$('p')[5].innerHTML = 'The user name and password cannot be empty';
			$('#remind').css('display', 'block');
			return;
	}
	//账号重复验证
	if(localStorage.getItem('users')) {
		userJSON = localStorage.getItem('users');//取得JSON字符串
		userJSON = JSON.parse(userJSON);
		var repeat = false; 
		for(var i = 0; i < userJSON.data.length; i++) {
			if(userJSON.data[i].user === newUser.user) { 
				repeat = true; 
				break;
			}
		}
		if(repeat) {
			$('p')[5].innerHTML = 'Registration failed, there is the same user name';
			$('#remind').css('display', 'block');
			//若账号重复提示相应信息
		} else { 
			userJSON.data.push(newUser); //将新用户push进去
			userJSON = JSON.stringify(userJSON); 
			localStorage.setItem('users', userJSON); 
			$('p')[5].innerHTML = 'Congratulations!Registered successfully';
			$('#remind').css('display', 'block');
			//注册成功显示相应提示信息
		}
	} else {
		userJSON.data.push(newUser);
		userJSON = JSON.stringify(userJSON);//转换为JSON格式 
		localStorage.setItem('users', userJSON);//JSON格式字符串存入
		$('p')[5].innerHTML = 'Congratulations!Registered successfully';
		$('#remind').css('display', 'block');
	}	
};

//以下为登陆验证
function login() {
	var userName = $('#user').val();
	var password = $('#password').val(); 
	var userJSON = localStorage.getItem('users');
	userJSON = JSON.parse(userJSON); //获取当前登陆用户信息以及所有用户信息
	var pass, nowUser;
	if(!userJSON) {
		pass = false; 
	} else {
		for (var i = 0; i < userJSON.data.length; i++) {
			if(userJSON.data[i].user == userName && userJSON.data[i].pass == password) {
				//登陆成功后，记录当前用户
				setcookie('username', userName, getDate(10), '/');
				setcookie('password', password, getDate(10), '/');
				nowUser = getcookie('username');
				pass = true;
				break;
			}
		}
	}
	if(pass) {
		//登陆通过后，显示内容以及continue按钮，登陆板块消失，将错误板块换成相应信息并隐藏
		$('#content').css('display', 'block');
		$('#go').css('display', 'block');
		$('#remind').css('display', 'none');
		$('#login').css('display', 'none');
		$('p')[0].innerHTML = 'Welcome to Dynamic Quiz,' + nowUser;
		$('p')[5].innerHTML = 'Please input your answer!';
		$('#user').val('');
		$('#password').val(''); //username跟password清空
	} else {
		$('p')[5].innerHTML = 'Failed,please check the username and password';
		$('#remind').css('display', 'block');//提示相应错误
	}	
};

//以下为进入下一步的方法
function next() {
	var i = parseInt($('p')[0].textContent);
	if(!i) {
		i = $('p')[0].textContent.charAt(0);
	}
	var j = i - 1;
	var content = '';
	var v;
	if ($('#go').val() == 'try again') { //若是重新再做则全部初始化前一轮答案
		$('#go').val('continue');
		for(var k = 0;k < allQuestions.length;k++) {
			allQuestions[k].userAnswer = '';
		}			
	}
	$('#result').css('display', 'none');
	//判断进入答题还是已经显示题目还是选择题目
	if(i == 'W' && $('#content').css('display') == 'none') {
		//选择题库
		if ($('#One').hasClass('active')) {
      getJson('js/quiz.json');
		} else if($('#Two').hasClass('active')) {
			getJson('js/quiz2.json');
		} else if($('#Three').hasClass('active')) {
			getJson('js/quiz3.json');
		} else {
			getJson('js/quiz4.json');
		}
		$('#tab').css('display', 'none');	
		$('#content').css('display', 'block');
		$('p')[0].innerHTML = 'The question is just your chosen topic, let us go to the answer!';
	}else if(i == 'T') {
		//进入答题,显示第一题内容
		for(var k = 0;k < allQuestions[0].choices.length;k++) {
			v = (k+10).toString(36).toUpperCase();
			content += '<label for=' + v + '><input type="radio" name="select" value=' + v + ' id=' + v + '>' + allQuestions[0].choices[k] + '</label></br>';
		}
		$('p')[0].innerHTML = allQuestions[0].querstion + '</br>' + content; 
		if(allQuestions[0].userAnswer != undefined && allQuestions[0].userAnswer != '') {
			$('input[name="select"][value="' + allQuestions[0].userAnswer + '"]').attr('checked','checked');
		}		
	}	else if (i == 'W') {
		$('#tab').css('display', 'block');	
		$('#content').css('display', 'none');
	} else {
		//答题中，显示下一题
		//计算本题得分，记录当前答案
		allQuestions[j].userAnswer = $('input[name="select"]:checked').val();
		if(allQuestions[j].userAnswer == undefined) {
			$('#remind').css('display', 'block'); //答案为空则提出提醒，提醒板块出现
			return;
		} else if(allQuestions[j].userAnswer == allQuestions[j].answer) {
			allQuestions[j].correctAnswer = 1; //对则计分
		} else {
			allQuestions[j].correctAnswer = 0;		
		}
		$('#remind').css('display', 'none'); //在进入下一步之前，确保提醒板块在填了答案后消失
		//判断进入下一题还是结果
		if(i == allQuestions.length) {		
			var result = 0; //计算得分
			for(var k = 0;k < allQuestions.length;k++) {
				result += allQuestions[k].correctAnswer;
			}
			$('p')[0].innerHTML = 'Congratulations!Your final score is: ' + result;
			$('#go').css('display', 'none');	//continue按钮消失
			go.onclick = null;
		} else {			
			//进入下一题，获取内容
			$('#back').css('display', 'block'); 
			for(var k = 0;k < allQuestions[i].choices.length;k++) {
				v = (k+10).toString(36).toUpperCase();
				content += '<label for=' + v + '><input type="radio" name="select" value=' + v + ' id=' + v + '>' + allQuestions[i].choices[k] + '</label></br>';
			}
			$('p')[0].innerHTML = allQuestions[i].querstion + '</br>' + content;
			//来回修改时候，将已选的题目答案显示出来
			if(allQuestions[i].userAnswer != undefined && allQuestions[i].userAnswer != '') {
				$('input[name="select"][value="' + allQuestions[i].userAnswer + '"]').attr('checked','checked');
			}
		}
	}
};

//以下为返回上一题方法
function comeBack() {
	$('#remind').css('display', 'none'); //提醒清空
	var i = parseInt($('p')[0].textContent);
	if(!i) {
		i = $('p')[0].textContent.charAt(0);
	}
	var j = i - 1;
	var f = j - 1;
	var content = '';
	if(i == 'C') {
		//则在结果页面，back后返回主页
		var nowUser = getcookie('username');
		$('p')[0].innerHTML = 'Welcome to Dynamic Quiz,' + nowUser;
		//增加核对答案功能
		var result = '';
		for(var k = 0;k < allQuestions.length;k++) {
			result += '<tr><td>' + (k+1) + '.</td><td>' + allQuestions[k].correctAnswer + '</td></tr>';	
		}
		$('tbody')[0].innerHTML = result;
		$('#result').css('display', 'block');
		$('#go').css('display', 'block');
		$('#back').css('display', 'none'); //back按钮消失，continue按钮出现
		$('#go').val('try again'); //将continue改为try again 点击重新做题
	} else {
		allQuestions[j].userAnswer = $('input[name="select"]:checked').val(); //若非结果页面，记录当前的已选答案
		//获取上一题信息显示
		for(var k = 0;k < allQuestions[f].choices.length;k++) {
			v = (k+10).toString(36).toUpperCase();
			content += '<label for=' + v + '><input type="radio" name="select" value=' + v + ' id=' + v + '>' + allQuestions[f].choices[k] + '</label></br>';
		}
		$('p')[0].innerHTML = allQuestions[f].querstion + '</br>' + content;
		//显示上一题已选答案
		$('input[name="select"][value="' + allQuestions[f].userAnswer + '"]').attr('checked','checked');
		//若第一题则back按钮消失
		if(f == 0) {
			$('#back').onclick = null;
			$('#back').css('display', 'none');		
		}
	}
};

//以下为登出方法
function loggedOut() {
	if(confirm('Sure loggedOut the Dynamic Quiz?')) {
		 //判读是否选中记住密码
		if($('#remember').prop('checked') == false) {
			unset('username', '/');
			unset('password', '/'); //删除原本的cookied
		} else {
			//恢复一开始页面
			$('#user').val(getcookie('username'));
			$('#password').val(getcookie('password'));//自动输入密码用户	
		}
		//登陆界面出现，内容以及continue和back按钮隐藏，问题初始化
		$('#tab').css('display', 'none');
		$('#login').css('display', 'block');
		$('#content').css('display', 'none');
		$('#back').css('display', 'none');
		$('#go').css('display', 'none');
		$('#result').css('display', 'none');
		$('#go').val('continue');
		for(var k = 0;k < allQuestions.length;k++) {
			allQuestions[k].userAnswer = '';
		}	
	} else {
		return;
	}
};

//以下为记住用户登陆信息cookie
function setcookie(name, value, expires, path) {
	var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
	if(expires instanceof Date) {
		cookieText += '; expires=' + expires.toUTCString();
	}
	if (path) {
		cookieText += '; path=' + path;
	}
	document.cookie = cookieText;
};
function getcookie(name) {
	var cookieName = encodeURIComponent(name) + '=';
	var cookieStart = document.cookie.indexOf(cookieName);
	var cookieValue = null;
	if (cookieStart > -1) {
		var cookieEnd =	document.cookie.indexOf(';', cookieStart);
		if(cookieEnd == -1) {
			cookieEnd = document.cookie.length;
		}
		cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
	}
	return cookieValue;
};
function unset(name, path) {
	setcookie(name, '', new Date(0), path);
};

//以下为获取n天后时间方法
function getDate(n) {
	var time = new Date().getTime();
  var newTime = time + n*24*60*60*1000;
  return new Date(newTime);
};
