//***************************************** BUDGET CONTROLLER *****************************************
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var data = {
    allItems: {
      inc: [],
      exp: [],
      
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    utemPercentages : {
      id : [],
      perc : [] ,
    },
    budget : 0,
    percentage : -1,

  };

  var  caluclateTotal = function(type){
    var sum=0;
    data.allItems[type].forEach(function(current) {
        sum += current.value;
    })
    data.totals[type] = sum;
  }
    
  

  
  return {
    addItems: function (type, desc, val) {

      var newItem, ID
      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new items based on inc or exp
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val)
      }

      // Push the new item to newItem
      data.allItems[type].push(newItem);

      //return The new Element
      return newItem;
    },
    calculateBudget : function () {
      // 1. Calculate Totals
      caluclateTotal("inc");
      caluclateTotal("exp");

      // 2.Calculate Budget
      data.budget = data.totals.inc - data.totals.exp;

      // 3.Calculate percentage
        if(data.totals.inc >=  data.totals.exp){
        data.percentage = Math.round((data.totals.exp * 100 ) / data.totals.inc) ;
        }else {
          data.percentage = -1 ;
        }
    },
     
    getBudget :function(){ 
      return {
        income : data.totals.inc,
        expense : data.totals.exp,
        budget : data.budget,
        percentage : data.percentage,
      }
    },

    deleteBudgetItem : function(type,ID){
          var index ; 
          //get the array of all ids
          var ids = data.allItems[type].map(function(current){
            return current.id; 
          });
          //find the item index of the targeted id 
          index= ids.indexOf(ID);
          //delete the item
          data.allItems[type].splice(index,1);
          console.log(data.allItems[type])
      
    },
    // utemPercentages : {
    //   id : [],
    //   perc : [] ,
    // },

    
    // itemPercentage : function(type,item){
      
    //     var perc ; 
       
    //     perc = Math.round((item * 100 ) / data.totals.inc);
    //     if(perc > 100){
    //       perc = 100;
    //     }
    //     console.log(perc)
      
      
    // },
  };

})();


//***************************************** UI CONTROLLER *****************************************
var uiController = (function () {
  // Create object container of class names 
  var domStrings = {
    addType: '.add__type',
    addDesc: '.add__description',
    addVal: '.add__value',
    addBtn: '.add__btn',
    incomeList: '.income__list',
    expenseList: '.expenses__list',
    budgetlabel : '.budget__value',
    incomeLabel : '.budget__income--value',
    expenseLabel : '.budget__expenses--value',
    percentageLabel : '.budget__expenses--percentage',
    containerDom : '.container',

  }

  return {
    //get the values of inputs from the user and store it
    getInput: function () {
    
      return {
        type: document.querySelector(domStrings.addType).value, // inc or exp
        description: document.querySelector(domStrings.addDesc).value,
        value: parseFloat(document.querySelector(domStrings.addVal).value),

      }
    },
    // add new data to UI 
    addToList: function (obj, type) {

      var html, newHTML,list;
     
      if (type === "inc" ) {
        list = document.querySelector(domStrings.incomeList);
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        list = document.querySelector(domStrings.expenseList);
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      //replace the placeholder with new data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', obj.value);
      list.insertAdjacentHTML('beforeend', newHTML);
    
    },
      //clear inputs after submiting new item
    clearInt: function () {
      var fields = document.querySelectorAll(domStrings.addDesc +" , "+domStrings.addVal);
      var arrFields = Array.prototype.slice.call(fields);
      arrFields.forEach(function(current) {
          current.value = "";
    });
      // apply focus on description input after submit new item
     arrFields[0].focus();
    },

    displayBudget : function(obj){
      
      document.querySelector(domStrings.budgetlabel).textContent = obj.budget;
      document.querySelector(domStrings.incomeLabel).textContent = obj.income;
      document.querySelector(domStrings.expenseLabel).textContent = obj.expense;
      if(obj.percentage > 0 ){
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage +"%";
      }else{
       document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
      
    },

    deleteItem :function(itemTag){
      document.getElementById(itemTag).remove();
    },

    getDomStrings: function () {
      return domStrings;
    },


  }
})();



//***************************************** GLOBAL APP CONTROLLER *****************************************
var controller = (function (budgetCtrl, uiCtrl) {
  var dom = uiCtrl.getDomStrings();
  // Setup addEventListener
  var setUpEventListener = function () {

    document.querySelector(dom.addBtn).addEventListener('click', ctrlAddItem);
    document.querySelector(dom.addVal).addEventListener('keypress', function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      };
    });

    document.querySelector(dom.containerDom).addEventListener('click', ctrlDeleteItem );
  };

  //UPDATE BUDGET 
  var updateBudget = function () {
    
    //  1. Calculate the budget ******************
    budgetCtrl.calculateBudget();
    // TODO 2. Return the budget ******************
    var budget = budgetCtrl.getBudget();
    // TODO 3. Display the Budget to UI ******************
    uiCtrl.displayBudget(budget);
    
  }
  // Upddate Percentages
  var updatePerc = function(){
    //1.Calculate the percentage in the BudgController
      
      //array of all exp percentages - 



    //2.return the Percentage from the BudgController
    // Display the budget in the UI
  }
  
  //What's happen onClick
  var ctrlAddItem = function () {
      // 1. get Input data ******************
      var input = uiCtrl.getInput();
      if(input.value > 0 && input.description !== "" && !isNaN(input.value)){
      // 2. Add items to budget controller ******************
      var newItm = budgetCtrl.addItems(input.type, input.description, input.value); 
      // 3. Display items to UI ******************
      uiCtrl.addToList(newItm, input.type);
      // 4. Clear input field after submit new inc/exp
      uiCtrl.clearInt();
      // 5. Calculate and update the Budget ******************
        updateBudget();
      // get Percentage 
      budgetCtrl.itemPercentage(input.type , input.value);
      }
  };

  var ctrlDeleteItem = function(event){
    var itemId,splitItem,type,ID ;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemId){
      splitItem = itemId.split("-");
      type = splitItem[0];
      ID = parseInt(splitItem[1]);
    }
    //1.Delete item from Budget Controller 
    budgetCtrl.deleteBudgetItem(type,ID);
    //2.Delete item from User Interface
    uiCtrl.deleteItem(itemId);
    updateBudget();
   
    //return the new budget
   
    // var bu = budgetCtrl.getBudget();
    // uiCtrl.displayBudget(bu);

  }

  return {
    init: function () {
      console.log("App Started");
      uiController.displayBudget({
        budget : 0,
        income : 0,
        expense : 0,
        percentage : -1
      })
      setUpEventListener();
    },

  };


})(budgetController, uiController);

controller.init();