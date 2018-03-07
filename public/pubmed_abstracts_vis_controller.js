import {uiModules} from 'ui/modules';

import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';
import './directives/abstract_render.js';

const module = uiModules.get('kibana/pubmed_abstracts');
module.controller('PubmedAbstractsVisController', function ($scope) {

  // Visualisation options
  // const size = $scope.vis.params.pageSize || 10;
  //
  // $scope.limit = size;
  $scope.field = $scope.vis.params.field;
  $scope.limit = $scope.vis.params.pageSize || 10;
  $scope.searchSource.size($scope.limit);

  $scope.$watch('esResponse', resp => {
    if (resp) {
      $scope.hits = resp.hits.hits;
      $scope.field = $scope.vis.params.field;
      $scope.limit = $scope.vis.params.pageSize || 10;
      $scope.searchSource.size($scope.limit);
    }
  });
});
