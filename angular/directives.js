//need a clean way to look up error strings--we should pass in name, other fields,
//to a register of functions. not sure where that register should go--a service?

var validationMessages = {
  'required': function (attrs) { return (attrs.name || 'Value') + ' is required'; },
  'number': function (attrs) { return (attrs.name || 'Value') + ' must be a number'; },
  'minValue': function (attrs) { return (attrs.name || 'Value') + ' must be at least ' + attrs.minValue; }
};

angular.module('myApp', [])
  .directive("validated", function () {
    return {
      restrict: 'A',
      scope: {},
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelController) {
        scope.controller = ngModelController;
        scope.validElement = angular.element('<span></span>')
          .addClass('validation-message validation-success');
        scope.errorElement = angular.element('<span></span>')
          .addClass('validation-message validation-error');

        scope.displayedValidMessage = false;
        scope.displayedErrorMessage = false;

        scope.addErrorMessage = function () {
          var errorMessage;

          scope.validElement.remove();
          errorMessage = 'Not valid'
          for (key in scope.controller.$error) {
            if (scope.controller.$error[key] && validationMessages[key]) {
              errorMessage = attrs.validationMessage || validationMessages[key](attrs);
              break;
            }
          };
          scope.errorElement.text(errorMessage);

          scope.displayedValidMessage = false;
          scope.displayedErrorMessage = true;

          element.parent().append(scope.errorElement);
        }

        scope.showValidMessage = function () {
          if (scope.displayedErrorMessage) {
            scope.errorElement.remove();
            scope.displayedErrorMessage = false;

            scope.validElement.text('\u2713');
            element.parent().append(scope.validElement);
          }
        }

        scope.updateValidMessage = function () {
          if (scope.displayedValidMessage) {
            scope.validElement.remove();
          } else {
            scope.showValidMessage();

            scope.displayedValidMessage = true;
          }
        }

        element.bind('keyup change', function (event) {
          var isValid;

          if (scope.controller.$pristine) {
            return;
          };

          isValid = scope.controller.$valid
          element.parent().toggleClass('error', !isValid);
          if (isValid) {
            scope.showValidMessage();
          } else {
            scope.addErrorMessage();
          }
        });

        element.bind('blur', function (event) {
          var isValid;

          if (scope.controller.$pristine) {
            return;
          };

          isValid = scope.controller.$valid
          element.parent().toggleClass('error', !isValid);
          if (isValid) {
            scope.updateValidMessage();
          } else {
            scope.addErrorMessage();
          }
        });
      }
    };
  }).directive('minValue', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function($scope, $element, $attrs, ngModelController) {
        $scope.updateValidity = function (value) {
          var valid;

          valid = (value >= parseInt($attrs.minValue, 10));
          ngModelController.$setValidity('minValue', valid);
          return value;
        };

        ngModelController.$parsers.unshift($scope.updateValidity);
        ngModelController.$formatters.unshift($scope.updateValidity);
      }
    };
  });
