angular.module('starter.controllers', ['ngCordova'])

.controller('HomeCtrl', function($scope, $http, $cordovaBarcodeScanner) {
  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      $scope.getInfo(imageData.text);
      // console.log(imageData.text);
      // console.log("Barcode Format -> " + imageData.format);
    }, function(error) {
      console.log("An error happened -> " + error);
    });
  };
  $scope.getInfo = function(barcode) {
    $scope.glutenIngredients = "";
    $scope.problemIngredients = "";
    $http({url:"https://kendrick-glutentracker-webapp.herokuapp.com/checkbarcode/" + barcode}).then(function(data) {
      console.log("data", data);
      console.log("ingredients", data.data.nf_ingredient_statement);
      $scope.item_name = data.data.item_name;
      console.log('item name:', data.data.item_name);
      $scope.brand_name = data.data.brand_name;
      console.log('brand name:', data.data.brand_name);
      if (data.data.nf_ingredient_statement === null || data.data.nf_ingredient_statement === undefined) {
        $scope.message = "Ut oh! Looks like we can't find the ingredients... please check the manufacturer's website";
      } else {
        return $http.post("https://kendrick-glutentracker-webapp.herokuapp.com/checkingredients", ingredientArry(data.data.nf_ingredient_statement)).then(function(data){
          console.log(data);
          //gives an array of objects
          var results = data.data;
          var glutenIngredients = [];
          var problemIngredients = [];
          if (results.length === 0) {
            $scope.message = "YAY ... NO GLUTEN FOUND! Put it in your cart!";
            console.log("item does not contain gluten");
          }
          for (var i = 0; i < results.length; i++) {
            if (results[i].contain_gluten === "m") {
              $scope.message = "MIGHT Contain Gluten, Please check the manufacturer's website!";
              problemIngredients.push(results[i].ingredient);
              $scope.problemIngredients = problemIngredients;
            } else if(results[i].contain_gluten === "g") {
              $scope.message = "OH NO... CONTAINS GLUTEN!! Sorry but it needs to go back on the shelf!";
              glutenIngredients.push(results[i].ingredient);
              $scope.glutenIngredients = glutenIngredients;
              break;
            }
          }
        });
      }
      barcode = "";
    });
  };
})

.controller('ProductsCtrl', function($scope, $http, $ionicPopup) {
  function refreshList() {
  //get list of products from db
    $http({url:"https://kendrick-glutentracker-webapp.herokuapp.com/products/"})
    .then(function(data){
      console.log(data);
      //tie products to the scope
      $scope.products = data.data;
      products = $scope.products;
    });
  }

    $scope.addProduct = function(product) {
      $scope.product = "";
      $http.post("https://kendrick-glutentracker-webapp.herokuapp.com/addProduct", {"product": product})
      .then(function(data) {
        var myPopup = $ionicPopup.alert({
          title: "Yippee!",
          template: "Your product was added"
        });

        refreshList();
      });
    };
    refreshList();
});



function ingredientArry(str) {
  str = str.toLowerCase();
  var res = str.replace("and/or ", ",");
  var res2 = res.replace(/\]|\)|\.|Contains Two Percent or Less of|Contains Less than 2% of Each of the Following:/g, "");
  var res3 = res2.replace(/\[|\(|and |or |\:/gi, ",");
  var arry = res3.split(",");
  var noSpaceArry = [];
  for(var i = 0; i < arry.length; i++) {
    noSpaceArry.push(arry[i].trim());
  }
  console.log(noSpaceArry);
  return JSON.stringify(noSpaceArry);
}
