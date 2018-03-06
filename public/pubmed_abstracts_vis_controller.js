import {uiModules} from 'ui/modules';

import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';
import './directives/abstract_render.js';

const module = uiModules.get('kibana/pubmed_abstracts');
module.controller('PubmedAbstractsVisController', function ($scope, $sce, createNotifier, getAppState, config, Private) {
  // const notify = createNotifier({
  //   location: 'Pubmed Abstracts'
  // });
  // const queryFilter = Private(FilterBarQueryFilterProvider);

  // Visualisation options
  const size = $scope.vis.params.pageSize || 10;
  const field = $scope.vis.params.field || 'abstract_classes';

  $scope.searchSource.size(size);
  $scope.limit = size;

  // const indexPattern = $scope.searchSource.get('index');

  $scope.$watch('esResponse', resp => {
    if (resp) {
      $scope.hits = resp.hits.hits;
    }
  });

  // check if there are no results and the search contains an alias set
  // $scope.$watch('hits', hits => {
  //   console.warn('new hits coming...');
  //   console.log(hits);
  //   if (hits && hits.length === 0) {
  //     const $state = getAppState();
  //     // const fields = extractFieldsFromQuery($state.query.query_string.query);
  //     // _.each(fields, function (field) {
  //       // if (_.contains($scope.vis.params.columnAliases, field) && !(_.contains($scope.vis.params.columns, field))) {
  //         // const alias = $scope.vis.params.columns[_.indexOf($scope.vis.params.columnAliases, field)];
  //         // return notify.warning(`You seem to be using an alias: [${field}]. The actual field name you probably want is: [${alias}]`);
  //       // }
  //     // });
  //   }
  // });

  // Investigate: Need to watch pageSize in case the parameter is removed ( = set to null) in the editor manually
  // $scope.$watch('vis.params.pageSize', pageSize => {
  //   if (!pageSize) {
  //     $scope.vis.params.pageSize = config.get('discover:sampleSize');
  //   }
  // });

});
