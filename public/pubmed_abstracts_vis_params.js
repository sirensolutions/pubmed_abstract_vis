import _ from 'lodash';
import 'plugins/scatterplot_vis/directives/scatterplot_agg_selector';
import 'plugins/scatterplot_vis/directives/scatterplot_metric_selector';
import paramsTemplate from 'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis_params.html';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/pubmed_abstract_vis');

module.directive('pubmedAbstractsVisParams', function () {
  return {
    restrict: 'E',
    template: paramsTemplate,
    link: function ($scope) {

      if (!$scope.vis) {
        return;
      }

      const fields = _.sortBy($scope.vis.indexPattern.fields, 'name');

      $scope.listFields = fields.filter(function (f) {
        return f.filterable && !_.includes($scope.vis.indexPattern.metaFields, f.name)
          && (!_.endsWith(f.name, '.raw') || (_.endsWith(f.name, '.raw') && f.readFromDocValues))
          && (f.type === 'string');
      });

      $scope.listFields.splice(0, 0, {
        name: '',
        displayName: ''
      });
    }
  };
});
