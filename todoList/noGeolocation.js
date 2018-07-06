function displayLocation() {
    console.log("No Geolocation support!");
    addTodoTopage(todoItem);
}

function buildTodoStr(todoItem, daysLeft) {
    // construct a todo description without location information
    var todoStr = todoItem.who + " needs to " + todoItem.task + " by "
                  + todoItem.dueDate + " " + daysLeft;
    return todoStr;
}
