// BUDGET CONTROLLER

var budgetController = (function(){
    // SOME CODE
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum;
        sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,

    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length == 0){
                ID = 1;
            }
            else{
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else{
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        calculateBudget: function(){
            // calculate total income and expenses.
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
        testing: function(){
            console.log(data);
        }
    };

})();


var UIController = (function(){
    // SOME UI CODE

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputbtn: '.add__btn',
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    return {
        getinput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        addListItem: function(obj, type){
            var html, newhtml, element;
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>\
                <div class="right clearfix"><div class="item__value">%value%</div>\
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                </div></div></div>';
            }
            else{
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">\<div class="item__description">%description%</div>\
                <div class="right clearfix">\<div class="item__value">%value%</div>\<div class="item__percentage">21%</div>\
                <div class="item__delete">\<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                </div></div></div>';
            }
            newhtml = html.replace('%id', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%',this.formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },
        deleteListItem: function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr  = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = this.formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            }
            
        },

        displayPercentages: function(percentages){
            //Node List
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '----';
                }
            });
        },
        formatNumber: function(num, type){
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];
            if(int.length >= 4 ){
                int  =  int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
            }
            type === 'exp' ? sign = '-' : sign = '+';
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        },
        displayMonth: function(){
            var now, year, month, months;
            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September'
                        , 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month =  now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputbtn).classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})();

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputbtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        // 4. Calculate the budget.
        // 5. Return Budget.
        var budget = budgetCtrl.getBudget();
        // 5. Display the budget on the UI.
        // console.log(budget);
        UICtrl.displayBudget(budget);
    };
    var updatePercentages = function(){
        // Calculate the percentages.
        budgetCtrl.calculatePercentages();
        // Read percentages from Budget controller.
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        // Update the UI.
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the Input Data.
        // 2. Add  the item to budget controller.
        // 3. Add the item to the UI.
        // 5. Call updateBudget
        input = UICtrl.getinput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // console.log(input);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
        else{
            prompt("Please Enter Values in All The Fields");
        }
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // console.log(type,ID);
            //1. Delete the item from Data Structure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new Budget
            updateBudget();

            updatePercentages();
        }
    };
    return {
        init: function(){
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            UICtrl.displayMonth();
            console.log("App has started");
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();