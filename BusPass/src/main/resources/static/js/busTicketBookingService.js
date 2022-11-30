var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const userId = localStorage.getItem("userId");
    var URL = "https://fir-1c7de-default-rtdb.firebaseio.com";
    $scope.userName = localStorage.getItem("userName");
    $scope.orderDetails = {};
    // $scope.routeList = [{
    //     "busName": "BUS-105",
    //     "route": "Alabama - Alaska",
    //     "time": "21:30",
    //     "price": "10"
    // }, {
    //     "busName": "BUS-106",
    //     "route": "Arkansas - California",
    //     "time": "05:15",
    //     "price": "8"
    // }, {
    //     "busName": "BUS-107",
    //     "route": "Delaware - Colorado",
    //     "time": "22:45",
    //     "price": "7"
    // }, {
    //     "busName": "BUS-108",
    //     "route": "Connecticut - Florida",
    //     "time": "05:00",
    //     "price": "10"
    // }, {
    //     "busName": "BUS-109",
    //     "route": "Hawaii - Indiana",
    //     "time": "04:30",
    //     "price": "12"
    // }, {
    //     "busName": "BUS-110",
    //     "route": "Kansas - 	Maine",
    //     "time": "23:00",
    //     "price": "9"
    // }, {
    //     "busName": "BUS-117",
    //     "route": "Missouri - Nevada",
    //     "time": "05:30",
    //     "price": "7"
    // }, {
    //     "busName": "BUS-205",
    //     "route": "North Carolina - New York",
    //     "time": "04:20",
    //     "price": "8"
    // }, {
    //     "busName": "BUS-305",
    //     "route": "New York - Oklahoma",
    //     "time": "04:45",
    //     "price": "13"
    // }, {
    //     "busName": "BUS-505",
    //     "route": "Texas - Vermont",
    //     "time": "22:45",
    //     "price": "12"
    // }];
    $scope.seatList = [];

    $scope.viewOrderTableData = [];

    $scope.onload = function () {
        $(".routeCls").show();
        $(".paymentCls").hide();
        $(".referCls").hide();
        $("#routeAddDivId").hide();
        for (i = 1; i <= 40; i++) {
            $scope.seatList.push(i);
        }
        getRouteList();
    }
    $scope.placeOrder = function (data) {
        $scope.orderDetails = data;
        $scope.getOrderTableData("BOOKING");
    }
    $scope.addOrder = function () {

        if (checkIsNull($("#contactId").val()) || checkIsNull($("#userEmailId").val())
            || checkIsNull($("#bookingDateId").val()) || checkIsNull($("#seatId").val())) {
            alert("Please fill all the required data");
        } else {
            let reqstBody = {
                "price": $scope.orderDetails.price,
                "orderDate": new Date($("#bookingDateId").val()).toISOString().split('T')[0],
                "status": "pending",
                "contactId": $("#contactId").val(),
                "userEmailId": $("#userEmailId").val(),
                "seatId": $("#seatId").val(),
                "busName": $scope.orderDetails.busName,
                "time": $scope.orderDetails.time,
                "route": $scope.orderDetails.route

            };
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/bookBusticket/" + userId + ".json",
                data: JSON.stringify(reqstBody),
                success: function (response) {
                    $('#placeOrderModalId').modal('hide');
                    $scope.switchMenu("BILLING", "billingTabId");
                    alert("Operation has been completed sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.getOrderTableData = function (type) {
        $scope.viewOrderTableData = [];
        let orderList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/bookBusticket/" + userId + ".json",
            success: function (response) {
                for (let i in response) {
                    let eventData = response[i];
                    eventData["orderId"] = i;
                    orderList.push(eventData);
                }
                const seatNo = [];
                orderList.forEach(function (obj) {
                    seatNo.push(Number(obj.seatId));
                })
                if (type != "BOOKING") {
                    $scope.viewOrderTableData = orderList.filter(function (obj) {
                        if (type == "BILLING") {
                            return obj.status === "pending";
                        } else {
                            return obj.status != "pending";
                        }
                    })
                } else {
                    $scope.seatList = [];
                    for (i = 1; i <= 40; i++) {
                        if (!seatNo.includes(i)) {
                            $scope.seatList.push(i);
                        }
                    }
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getOrderData = function (data) {
        $("#ammountId").val(data.price);
        $scope.orderDetails = data;

    }
    $scope.payBill = function () {
        if ($("#paymentModeId").val() == "") {
            alert("Please select payment mode");
        } else {
            let requestBody = {
                "status": $("#paymentModeId").val()
            }
            $.ajax({
                type: 'patch',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/bookBusticket/" + userId + "/" + $scope.orderDetails.orderId + ".json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#processToPayModalId').modal('hide');
                    $scope.getOrderTableData("BILLING");
                    alert("Payment sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "loginReg.html";
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#routeDivId").hide();
        $("#biilingId").hide();
        $("#routeAddDivId").hide();
        if (type == "MENU") {
            $("#routeDivId").show();
            getRouteList();
        } else if (type == "BILLING") {
            $("#biilingId").show();
            $scope.getOrderTableData("BILLING");
        } else if (type == "HISTORY") {
            $("#biilingId").show();
            $scope.userName == 'ADMIN' ? $scope.getAdminTableData() : $scope.getOrderTableData("HISTORY");
        } else if (type == "ADD_ROUTE") {
            $("#routeAddDivId").show();
            clearData();
        }
    }
    function clearData() {
        $("#busNameId").val('');
        $("#routeNameId").val('');
        $("#timeId").val('');
        $("#priceId").val('');

    }
    function getRouteList() {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewRoute.json",
            success: function (lresponse) {
                $scope.routeList = [];
                for (let i in lresponse) {
                    let data = lresponse[i];
                    data["newRouteId"] = i;
                    $scope.routeList.push(data);
                }
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.addRoute = function () {
        let requestBody = {
            "busName": $("#busNameId").val(),
            "route": $("#routeNameId").val(),
            "time": $("#timeId").val(),
            "price": $("#priceId").val()
        };
        $.ajax({
            type: 'post',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewRoute.json",
            data: JSON.stringify(requestBody),
            success: function (response) {
                alert("Data added sucessfully!!!");
                clearData();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.removeRoute = function (data) {

        $.ajax({
            type: 'delete',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/addNewRoute/" + data.newRouteId + ".json",
            success: function (response) {
                alert("Removed successfuly !!!");
                getRouteList();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });

    }
    $scope.getAdminTableData = function () {
        $scope.viewOrderTableData = [];
        let routeList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/bookBusticket.json",
            success: function (response) {
                for (let data in response) {
                    for (let x in response[data]) {
                        let eventData = response[data][x];
                        eventData["userId"] = data;
                        eventData["childUserId"] = x;
                        routeList.unshift(eventData);
                    }
                }
                $scope.viewOrderTableData = routeList.filter(function (obj) {
                    return obj.status != "pending";
                })
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    function checkIsNull(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }
    function resetData() {
        $("#bookingDateId").val("");
        $("#seatId").val("");
        $("#userEmailId").val("");
        $("#passwordId").val("");
        $("#contactId").val("");

    }
    $(document).ready(function () {
        $('#placeOrderModalId').on('hidden.bs.modal', function (e) {
            resetData();
        })
    });
});
