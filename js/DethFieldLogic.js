'use strict';

(function() {//leave only brackets {}
	//Variables===============================================================

	const currentTasksContainer = document.getElementById('currentTasks'),
			completedTasksContainer = document.getElementById('completedTasks'),

			toDoTitle = document.getElementById('currentTasksTitle'),
			completedTitle = document.getElementById('completedTasksTitle'),

			taskClass = '.list-group-item',

			formAddTask = document.getElementById('newTaskForm'),
			radiosPriority = formAddTask.querySelectorAll('input[name=\'gridRadios\']'),
			radiosColor = formAddTask.querySelectorAll('input[name=\'gridRadiosColor\']'),

			formEditTask = document.getElementById('editTaskForm'),
			radiosPriorityEdit = formEditTask.querySelectorAll('input[name=\'gridRadios\']'),
			radiosColorEdit = formEditTask.querySelectorAll('input[name=\'gridRadiosColor\']'),

			body = document.querySelector('body'),
			modalWindows = document.querySelectorAll('.modal-content'),
			navbar = document.querySelector('.navbar'),
			taskThemes = {
				Blue: {
					themeName: 'Blue',
					bgColor: 'bg-primary',
					textColor: 'text-white',
					themeClass: '_blue'
				},
				Green: {
					themeName: 'Green',
					bgColor: 'bg-success',
					textColor: 'text-white',
					themeClass: '_green'
				},
				Light: {
					themeName: 'Light',
					bgColor: 'bg-white',
					textColor: 'text-dark',
					themeClass: '_light'
				}
			},
			appThemes = {
				Light: {
					body: 'bg-white text-dark',
					navbar: 'bg-light',
					modalWindows: 'bg-white'
				},
				Dark: {
					body: 'text-white bg-dark',
					navbar: 'bg-secondary',
					modalWindows: 'bg-dark'
				}
			},

			sortToUpBtn = document.getElementById('sortToUp'),
			sortToDownBtn = document.getElementById('sortToDown');

	let editedTask,
		 currentTasksStorage = [],
		 completedTasksStorage = [],
		 taskData = {},
		 taskID = 0,
		 appCurrentThemeClass = '';

	//Calling functions=======================================================

	currentTasksStorage = parseLocalStorage(currentTasksStorage, 'currentTasks');
	completedTasksStorage = parseLocalStorage(completedTasksStorage, 'completedTasks');
	if (localStorage.getItem('lastTaskID')) taskID = localStorage.getItem('lastTaskID');
	appCurrentThemeClass = localStorage.getItem('theme');
	body.className = localStorage.getItem('theme'); //appCurrentThemeClass instead

	updateTasksCountersInTitles();

	refreshButtonsListeners();

	formAddTaskListener();

	formEditTaskListener();

	changeThemeListener();

	sortListeners();

	//Work with Title Counters================================================

	function updateTasksCountersInTitles() {
		changeCountOfTasksInTitle(toDoTitle, currentTasksContainer);
		changeCountOfTasksInTitle(completedTitle, completedTasksContainer);
	}

	function changeCountOfTasksInTitle(title, containerOfTasks){
		const //tasks = containerOfTasks.querySelectorAll(taskClass),
				count = getCountOfTasks(containerOfTasks),//tasks.length instead
				typeOfTask = title.textContent.split(' ')[0];

		switch(count) {
			case 1:
				title.textContent = typeOfTask + ` (${count} task)`;
				break;
			case 0:
				title.textContent = typeOfTask + ' (no tasks)';
				break;
			default:
				title.textContent = typeOfTask + ` (${count} tasks)`;
		}
	}

	function getCountOfTasks(containerOfTasks) {//don't need anymore
		const tasks = containerOfTasks.querySelectorAll(taskClass);
		let counter = 0;

		for (let i = 0; i < tasks.length; i++) counter++;

		return counter;
	}

	//Complete function=======================================================

	function completeTask(e) {
		const btn = e.target,
				task = btn.closest(taskClass);
		let isCompleted = false;

		if (btn.closest('#completedTasks')) {
			isCompleted = true;
		}

		saveCompleteToStorage(isCompleted, task);

		pushCompleteToHtml(isCompleted, task, btn);

		updateTasksCountersInTitles();
	}

	function saveCompleteToStorage(isCompleted, task) {//may changed - add new parameter storage and return result
		taskData = getTaskData(task);

		if (isCompleted) {
			const indexInStorage = completedTasksStorage.findIndex(item => item.taskID === taskData.taskID);
			completedTasksStorage.splice(indexInStorage, 1);
			currentTasksStorage.unshift(taskData);
		} else {
			const indexInStorage = currentTasksStorage.findIndex(item => item.taskID === taskData.taskID);
			currentTasksStorage.splice(indexInStorage, 1);
			completedTasksStorage.unshift(taskData);
		}

		updateLocalStorage();
	}

	function pushCompleteToHtml(isCompleted, task, btn) {
		if (isCompleted) {
			btn.textContent = 'Complete';
			btn.style.marginBottom = '';
			task.querySelector('.btn-info').style.display = '';
		} else {
			btn.textContent = 'Uncomplete';
			btn.style.marginBottom = '.5rem';
			task.querySelector('.btn-info').style.display = 'none';
		}

		if (isCompleted) {
			currentTasksContainer.insertBefore(task, currentTasksContainer.firstChild);
		} else {
			completedTasksContainer.insertBefore(task, completedTasksContainer.firstChild);
		}
	}

	//Delete function=========================================================

	function deleteTask(e) {
		let btn = e.target,
			 task = btn.closest(taskClass);

		saveDeleteToStorage(task);

		task.remove();

		updateTasksCountersInTitles();
	}

	function saveDeleteToStorage(task) {
		taskData = getTaskData(task);

		if (task.closest('#currentTasks')) {
			let index = currentTasksStorage.findIndex(item => taskData.taskID === item.taskID);
			currentTasksStorage.splice(index, 1);
		} else {
			let index = completedTasksStorage.findIndex(item => taskData.taskID === item.taskID);
			completedTasksStorage.splice(index, 1);
		}

		updateLocalStorage();
	}

	//Buttons listeners=======================================================

	function refreshButtonsListeners(){
		const completeButtons = document.querySelectorAll('._btn-complete'),
				deleteButtons = document.querySelectorAll('._btn-delete'),
				editButtons = document.querySelectorAll('._btn-edit');

		removeListeners(completeButtons, deleteButtons, editButtons);
		addListeners(completeButtons, deleteButtons, editButtons);
	}

	function removeListeners(completeButtons, deleteButtons, editButtons){
		for (let i = 0; i < completeButtons.length; i++) {
			completeButtons[i].removeEventListener('click', completeTask);
		}

		for (let i = 0; i < deleteButtons.length; i++) {
			deleteButtons[i].removeEventListener('click', deleteTask);
		}

		for (let i = 0; i < editButtons.length; i++) {
			editButtons[i].removeEventListener('click', catchEditedTask);
		}
	}

	function addListeners(completeButtons, deleteButtons, editButtons){
		for (let i = 0; i < completeButtons.length; i++) {
			completeButtons[i].addEventListener('click', completeTask);
		}

		for (let i = 0; i < deleteButtons.length; i++) {
			deleteButtons[i].addEventListener('click', deleteTask);
		}

		for (let i = 0; i < editButtons.length; i++) {
			editButtons[i].addEventListener('click', catchEditedTask);
		}
	}

	//Adding tasks============================================================

	function formAddTaskListener() {
		let newTask = {
			title: '',
			text: '',
			priority: '',
			date: '',
			theme: '',
		};

		formAddTask.addEventListener('submit', (e) => {
			e.preventDefault();

			calcNewTaskData(newTask);
			renderTask(newTask);
			resetAddTaskForm();

			refreshButtonsListeners();

			changeCountOfTasksInTitle(toDoTitle, currentTasksContainer);
		});
	}

	function calcNewTaskData(newTask) {
		newTask.date = new Date();
		newTask.title = document.getElementById('inputTitle').value;
		newTask.text = document.getElementById('inputText').value;

		for (let i = 0; i < radiosPriority.length; i++) {
			if (radiosPriority[i].checked) newTask.priority = radiosPriority[i].value;
		}

		for (let i = 0; i < radiosColor.length; i++) {
			if (radiosColor[i].checked) newTask.theme = taskThemes[radiosColor[i].value];
		}
	}

	function renderTask(newTask) {
		newTask.date = dateFormatSetting(newTask.date);

		const task = document.createElement('li');
		task.className = `list-group-item d-flex w-100 mb-2 ${newTask.theme.bgColor} ${newTask.theme.textColor} ${newTask.theme.themeClass}`;
		task.dataset.id = ++taskID;
		task.innerHTML = getTemplate(newTask);
		currentTasksContainer.insertBefore(task, currentTasksContainer.firstChild);

		taskData = getTaskData(task);
		currentTasksStorage.unshift(taskData);
		updateLocalStorage();
	}

	function dateFormatSetting(date) {
		let dateArray = [`${date.getHours()}`, `${date.getMinutes()}`, `${date.getDate()}`, `${date.getMonth() + 1}`, `${date.getFullYear()}`];

		for (let i = 0; i < dateArray.length; i++) {
			if (parseInt(dateArray[i]) < 10) {
				dateArray[i] = `0${dateArray[i]}`;
			}
		}

		return date = `${dateArray[0]}:${dateArray[1]} ${dateArray[2]}.${dateArray[3]}.${dateArray[4]}`;
	}

	function resetAddTaskForm() {
		formAddTask.querySelector('#inputTitle').value = '';
		formAddTask.querySelector('#inputText').value = '';

		for (let i = 0; i < radiosPriority.length; i++) {
			radiosPriority[i].checked = false;
		}
		for (let i = 0; i < radiosColor.length; i++) {
			radiosColor[i].checked = false;
		}
	}

	//Edit tasks==============================================================

	function catchEditedTask(e){
		const btn = e.target;
		editedTask = btn.closest(taskClass),

		taskData = getTaskData(editedTask);
		formEditAutoFill();
	}

	function formEditAutoFill() {
		formEditTask.querySelector('#inputTitle-Edit').value = taskData.title;
		formEditTask.querySelector('#inputText-Edit').value = taskData.text;

		for (let i = 0; i < radiosPriorityEdit.length; i++) {
			if (radiosPriorityEdit[i].value === taskData.priority) {
				radiosPriorityEdit[i].checked = true;
				break;
			}
		}

		for (let i = 0; i < radiosColorEdit.length; i ++) {
			if (radiosColorEdit[i].value === taskData.theme.themeName) {
				radiosColorEdit[i].checked = true;
				break;
			}
		}
	}

	function formEditTaskListener() {
		formEditTask.addEventListener('submit', (e) => {
			e.preventDefault();

			formValuesToTaskData();

			editTask();
		});
	}

	function formValuesToTaskData() {
		taskData.title = document.getElementById('inputTitle-Edit').value;
		taskData.text = document.getElementById('inputText-Edit').value;

		for (let i = 0; i < radiosPriorityEdit.length; i++) {
			if (radiosPriorityEdit[i].checked) {
				taskData.priority = radiosPriorityEdit[i].value;
				break;
			}
		}
		for (let i = 0; i < radiosColorEdit.length; i++) {
			if (radiosColorEdit[i].checked) {
				taskData.theme = taskThemes[radiosColorEdit[i].value];
				break;
			}
		}
	}

	function editTask() {
		const indexInStorage = currentTasksStorage.findIndex(item => item.taskID === taskData.taskID);

		editedTask.querySelector('h5').textContent = taskData.title;
		editedTask.querySelectorAll('small')[0].textContent = `${taskData.priority} priority`;
		editedTask.querySelector('p').textContent = taskData.text;
		editedTask.className = `list-group-item d-flex w-100 mb-2 ${taskData.theme.bgColor} ${taskData.theme.textColor} ${taskData.theme.themeClass}`;

		taskData = getTaskData(editedTask);
		currentTasksStorage[indexInStorage] = taskData;
		updateLocalStorage();
	}

	//Template of task======================================================

	function getTemplate(taskData, isCompleted = false) {
		let btnCompleteStyle = isCompleted ? 'style="margin-bottom: .5rem;"' : '',
			 btnCompleteText = isCompleted ? 'Uncomplete' : 'Complete',
			 btnInfoStyle = isCompleted ? 'style="display:none;"' : '';

		return`
            <div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${taskData.title}</h5>
                    <div>
                        <small class="mr-2">${taskData.priority} priority</small>
                        <small>${taskData.date}</small>
                    </div>

                </div>
                <p class="mb-1 w-100">${taskData.text}</p>
            </div>
            <div class="dropdown m-2 dropleft">
                <button class="btn btn-secondary h-100" type="button" id="dropdownMenuItem1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </button>
                <div class="dropdown-menu p-2 flex-column" aria-labelledby="dropdownMenuItem1" x-placement="left-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-162px, 0px, 0px);">
                    <button type="button" class="btn btn-success _btn-complete w-100" ${btnCompleteStyle}>${btnCompleteText}</button>
                    <button type="button" class="btn btn-info _btn-edit w-100 my-2" data-toggle="modal" data-target="#editModal" ${btnInfoStyle}>Edit</button>
                    <button type="button" class="btn btn-danger _btn-delete w-100">Delete</button>
                </div>
            </div>
		`
	}

	//Change Theme============================================================

	function changeThemeListener() {
		const lightThemeBtn = document.getElementById('btnLightMode'),
				darkThemeBtn = document.getElementById('btnDarkMode');

		lightThemeBtn.addEventListener('click', () => {
			body.className = '';
			appCurrentThemeClass = '';
			localStorage.setItem('theme', appCurrentThemeClass);
		});
		darkThemeBtn.addEventListener('click', () => {
			body.className = 'dark';
			appCurrentThemeClass = 'dark';
			localStorage.setItem('theme', appCurrentThemeClass);
		});
	}

	//Local Storage===========================================================

	function getTaskData(task) {
		const data = {
			taskID: task.dataset.id,
			classList: task.classList.value,
			title: task.querySelector('h5').textContent,
			priority: task.querySelectorAll('small')[0].textContent.split(' ')[0],
			date: task.querySelectorAll('small')[1].textContent,
			text: task.querySelector('p').textContent
		};

		for (let theme in taskThemes) {
			if (task.className.includes(`${taskThemes[theme].bgColor} ${taskThemes[theme].textColor} ${taskThemes[theme].themeClass}`)) data.theme = taskThemes[theme];
		}

		return data;
	}

	function updateLocalStorage() {
		localStorage.clear();

		localStorage.setItem('lastTaskID', taskID);
		localStorage.setItem('theme', appCurrentThemeClass);
		for (let i = 0; i < currentTasksStorage.length; i++) {
			localStorage.setItem(`currentTasks(${i})`, JSON.stringify(currentTasksStorage[i]));
		}
		for (let i = 0; i < completedTasksStorage.length; i++) {
			localStorage.setItem(`completedTasks(${i})`, JSON.stringify(completedTasksStorage[i]));
		}
	}

	function parseLocalStorage(arrayStorage, key) {
		let countOfKeys = 0;

		arrayStorage = [];

		while (localStorage.getItem(key + `(${countOfKeys})`)) {
			countOfKeys++;
		}

		if (countOfKeys) {
			for (let i = 0; i < countOfKeys; i++) {
				arrayStorage.push(JSON.parse(localStorage.getItem(key + `(${i})`)));
			}
		}

		for (let i = 0; i < arrayStorage.length; i++) {
			let taskContainer = document.createElement('li');
			taskContainer.className = arrayStorage[i].classList;
			taskContainer.dataset.id = arrayStorage[i].taskID;

			if (key === 'currentTasks') {
				currentTasksContainer.appendChild(taskContainer);
				taskContainer.innerHTML = getTemplate(arrayStorage[i]);
			}
			else {
				const isCompleted = true;
				completedTasksContainer.appendChild(taskContainer);
				taskContainer.innerHTML = getTemplate(arrayStorage[i], isCompleted);
			}
		}

		return arrayStorage;
	}

	//Sorting=================================================================

	function sortListeners() {
		sortToUpBtn.addEventListener('click', () => {
			sortStorage();
			updateHtml()
			refreshButtonsListeners();
		});
		sortToDownBtn.addEventListener('click', () => {
			const inverse = true;
			sortStorage(inverse);
			updateHtml();
			refreshButtonsListeners();
		});
	}

	function sortStorage(inverse = false) {
		currentTasksStorage.sort(compareTasks);
		completedTasksStorage.sort(compareTasks);

		if (inverse) {
			currentTasksStorage.reverse();
			completedTasksStorage.reverse();
		}

		updateLocalStorage();
	}

	function compareTasks(taskA, taskB) {
		if (taskA.taskID > taskB.taskID) return -1;
		if (taskA.taskID === taskB.taskID) return 0;
		if (taskA.taskID < taskB.taskID) return 1;
	}

	function updateHtml() {
		const tasks = document.querySelectorAll('li');
		tasks.forEach(item => item.remove());

		parseLocalStorage(currentTasksStorage, 'currentTasks');
		parseLocalStorage(completedTasksStorage, 'completedTasks');
	}

})();