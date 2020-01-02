//Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;

    };



    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    }

    var data = {
        allItems: {
            exp: [],
            inc: []

        },

        totals: {
            exp: 0,
            inc: 0

        },
        budget: 0,
        percentage: -1

    };

    var calculateTotals = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (e) {
            sum += e.value;

        });

        data.totals[type] = sum;
    };



    return {
        addItem: function (type, des, val) {
            var newItem;
            var ID;
            

            if (data.allItems[type].length > 0) {
                 //data.allitems[exp 0r inc][last index].id ko 1 plus
                ID = data.allItems[type][data.allItems[type].length-1].id+1; 
            }else {
                ID = 0;
            }

            if (type === "exp") {
                newItem = new Expense (ID, des, val);
            } else if (type === "inc"){
                newItem = new Income(ID, des, val);


            }

            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;

            //creating new array which is only including id
            ids = data.allItems[type].map(function (element) {
                return element.id;

            });

            //searching index number of id in the ids array
            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }

        },

        calculateBudget : function () {
            // Calculate total income and expense
            calculateTotals("inc");
            calculateTotals("exp");

            // Calculate the budget: income-expense

            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we spent

           if (data.totals.inc > 0) {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
           }else {
               data.percentage = -1;
           }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(element) {
                element.calcPercentage(data.totals.inc);

            });


        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function(element) {
                return element.getPercentage();

            });

            return allPerc;


        },

        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp
            }

        },

        testing: function () {
            console.log(data);
            
        }

      
    };
    




})();

//UI controller
var UIController = (function () {

    var DOMstrings= {
        type: ".add__type",
        description: ".add__description",
        value: ".add__value",
        addBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expnesePercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"

    }

    var formatNumber = function (num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num= num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {

            int =  int.substr(0,int.length - 3) + "," +int.substr(int.length -3, 3);
        }

        

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+')+" " +int+"."+dec;


    };

    return {

        getInput: function () {
            return {
                // this value maybe exp or inc
                inputType: document.querySelector(DOMstrings.type).value,
                inputDescription: document.querySelector(DOMstrings.description).value,
                inputValue: parseFloat(document.querySelector(DOMstrings.value).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create html 
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';

            }else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            //Replace the placeholder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            //Insert the html into Dom

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

        
            

            

        },

        deleteItemLists: function (selectorId) {

            var el= document.getElementById(selectorId);

            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;
            fields =document.querySelectorAll(DOMstrings.description+"," +DOMstrings.value);

            fieldsArr= Array.prototype.slice.call(fields);

           fieldsArr.forEach(element => {
               element.value = "";
               
           });

            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {

            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
           

            if (obj.budget > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";

            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }



        },

        displayPercentage: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expnesePercLabel);

            // var nodeListForEach = function(list, callback) {

            //     for (var i = 0; i < list.length; i++) {
            //         callback(list[i], i);


            //     }

            // };

            // nodeListForEach(fields, function (current, index){

            //    if (percentages[index] > 0) {
            //        current.textContent = percentages[index] + "%";
            //    }else {
            //        current.textContent = "---";
            //    }

            // });

            fields.forEach(function (element,index){

                if (percentages[index] > 0){
                    element.textContent = percentages[index] + "%";
                }else {
                    element.textContent= "---";

                }

                

            });


        },

        displayMonth: function () {

            var now, month, months, year;

            now = new Date();

            months= ['January', 'Feburary','March','April', 'May','June','July','August','September','October','November','December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+' '+year;


        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.type+','+DOMstrings.description+','+DOMstrings.value

            );

            fields.forEach(function(e) {

                e.classList.toggle("red-focus");

            });

            document.querySelector(DOMstrings.addBtn).classList.toggle("red");

        },


        getDom: function () {
            return DOMstrings;
        }

    };



})();

//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () {

        var Dom = UICtrl.getDom();

        document.querySelector(Dom.addBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();




            }


        });

        document.querySelector(Dom.container).addEventListener("click",ctrlDeleteItem);

        document.querySelector(Dom.type).addEventListener("change",UICtrl.changeType);


    }

   

    var updateBudget = function() {

        // Calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // Display budget on the UI
       UICtrl.displayBudget(budget);
        

       


    };

    var updatePercentage = function () {

        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();   

        UICtrl.displayPercentage(percentages);
        

    };

    var ctrlAddItem = function () {
        var newItem, input;

        //Read the input field
        input = UICtrl.getInput();

        if (input.inputDescription !=="" && !isNaN(input.inputValue) && input.inputValue > 0) {

            //Add new Item
            newItem = budgetCtrl.addItem(input.inputType, input.inputDescription, input.inputValue);

            //Add new Item to UI
            UICtrl.addListItem(newItem, input.inputType);

            // Clear the input field
            UICtrl.clearFields();

            //Calculate the budget and Display

            updateBudget();

            //calculate and update percentages
            updatePercentage();

        }

        
        


    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;

        //Dom transverse
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            splitId = itemId.split("-");
            type = splitId[0];
            ID = parseInt(splitId[1]);

            // 1.delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteItemLists(itemId);


            // 3.update and show the budget
            updateBudget();

            //calculate and update percentages
            updatePercentage();
            
        }
        

    };

    return {
        init: function () {
            
            setupEventListener();

            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                percentage: 0,
                totalIncome: 0,
                totalExpense: 0
            });
            
        }
    };

   



})(budgetController, UIController);

controller.init();










