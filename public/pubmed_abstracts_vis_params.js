import _ from 'lodash';
import paramsTemplate from 'plugins/nlp_viz/pubmed_abstracts_vis_params.html';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/nlp_viz');

module.directive('pubmedAbstractsVisParams', function () {
  return {
    restrict: 'E',
    template: paramsTemplate,
    link: function ($scope) {

      if (!$scope.vis) {
        return;
      }

      const fields = _.sortBy($scope.vis.indexPattern.fields, 'name');

      $scope.listFields = fields

      $scope.listFields.splice(0, 0, {
        name: '',
        displayName: ''
      });

      $scope.tagcolors = [];

      $scope.addTagColor = function(tagcolor) {
        console.log('tagcolor:'+JSON.stringify(tagcolor));
        if(tagcolor){
          $scope.tagcolors.push(tagcolor);
        }
        else{
          $scope.tagcolors.push({'tag': "", 'color':""});
        }
      }

      $scope.deleteTagColor = function(tc) {
         var index = $scope.tagcolors.indexOf(tc);
         $scope.tagcolors.splice(index,1);
         delete $scope.vis.params['tagtype' + tc.$$hashKey];
         delete $scope.vis.params['tagcolor' + tc.$$hashKey];
      }

      for (var prop in $scope.vis.params) {
         if(prop.startsWith('tagtype')){
            var color = $scope.vis.params['tagcolor' + prop.substring(7)];
            var type = $scope.vis.params[prop];
            $scope.addTagColor({'tag': type, 'color':color, '$$hashKey': prop.substring(7) });
         }
      }

      if($scope.tagcolors.length==0){
          $scope.addTagColor();
      }
    }
  };
});





