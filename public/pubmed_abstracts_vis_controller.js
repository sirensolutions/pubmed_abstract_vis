import {uiModules} from 'ui/modules';

import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';
import './directives/abstract_render.js';

const module = uiModules.get('kibana/pubmed_abstracts');
module.controller('PubmedAbstractsVisController', function ($scope) {

  // Visualisation options
  $scope.field = $scope.vis.params.field;
  $scope.nlptagsfield = $scope.vis.params.nlptagsfield;
  $scope.nlptagidfield = $scope.vis.params.nlptagidfield;
  $scope.titlefield = $scope.vis.params.titlefield;
  $scope.limit = $scope.vis.params.limit || 10;
  $scope.legendid = $scope.vis.params.legendid;

  $scope.tagcolor = {};
  for (var prop in $scope.vis.params) {
     if(prop.startsWith('tagtype')){
        var color = $scope.vis.params['tagcolor' + prop.substring(7)];
        var type = $scope.vis.params[prop];
        $scope.tagcolor[type] = color;
     }
  }

  $scope.searchSource.size($scope.limit);

  $scope.$watch('esResponse', resp => {
    if (resp) {

      $scope.hits = resp.hits.hits;
      $scope.field = $scope.vis.params.field;
      $scope.nlptagsfield = $scope.vis.params.nlptagsfield;
      $scope.nlptagidfield = $scope.vis.params.nlptagidfield;
      $scope.titlefield = $scope.vis.params.titlefield;
      $scope.limit = $scope.vis.params.limit || 10;
      $scope.legendid = $scope.vis.params.legendid;

      $scope.tagcolor = {};
      for (var prop in $scope.vis.params) {
         if(prop.startsWith('tagtype')){
            var color = $scope.vis.params['tagcolor' + prop.substring(7)];
            var type = $scope.vis.params[prop];
            $scope.tagcolor[type] = color;
         }
      }
      $scope.searchSource.size($scope.limit);
    }
  });
});
