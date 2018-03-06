import {uiModules} from 'ui/modules';

import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';


const module = uiModules.get('kibana/chem_search_vis', ['kibana']);
module.controller('ChemSearchVisController', function ($scope, Private, $http) {
  $scope.molSearchApiBaseUrl = 'https://smiles-to-fingerprint-dot-chemical-search.appspot.com';

  const queryFilter = Private(FilterBarQueryFilterProvider);

  const moreLikeThisFilter = {
    meta: {
      alias: 'Compound: ' + $scope.vis.params.smiles,
      smiles: $scope.vis.params.smiles,
    },
    query: {
      more_like_this: {
        fields: [$scope.vis.params.field],
        like: $scope.vis.params.encoded_smiles,
        min_term_freq: 1,
        boost_terms: 2,
        min_doc_freq: 1,
        max_query_terms: 100,
        minimum_should_match: $scope.stringency,
      }
    }
  };

  $scope.stringency = 85; // default stringency
  $scope.min = 50; // minimum stringency
  $scope.max = 100; // maximum stringency

  updateVisibility(queryFilter.getFilters());

  // update the searchSource when filters update
  $scope.$listen(queryFilter, 'update', function () {
    updateVisibility(queryFilter.getFilters());
  });

  $scope.createFilter = function () {

    // here you have access to parameters saved
    // on the left hand side panel
    // when editing visualisation
    // e.g. you can grab "fields" and use them to generate the filter
    $http({
      url : `${$scope.molSearchApiBaseUrl}/fingerprint`,
      // url: 'https://localhost:8009/fingerprint',
      method: 'GET',
      params: {smiles: $scope.vis.params.smiles}
    }).success(function (response) {
      moreLikeThisFilter.query.more_like_this.like = response;
      moreLikeThisFilter.meta.alias = `Compound: ${$scope.vis.params.smiles}`;
      moreLikeThisFilter.meta.smiles = $scope.vis.params.smiles;
      moreLikeThisFilter.meta.source = 'mol-search';
      moreLikeThisFilter.query.more_like_this.fields = [$scope.vis.params.field];
      moreLikeThisFilter.query.more_like_this.minimum_should_match = $scope.stringency;

      queryFilter.addFilters(moreLikeThisFilter);
    });//TODO: handle errors
  };

  function pngToDataUrl(url, callback, outputFormat) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      let canvas = document.createElement('CANVAS');
      const ctx = canvas.getContext('2d');
      let dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback(dataURL);
      canvas = null;
    };
    img.src = url;
  }

  function updateVisibility(currFilters) {
    // Set the visibility accordingly to the current filters...
    // If there is a mol search filter currently applied or not
    const molSearchFilter = currFilters.filter(f => f.meta && f.meta.smiles && !f.meta.disabled)[0];
    if (molSearchFilter) {
      pngToDataUrl(`${$scope.molSearchApiBaseUrl}/depict?smiles=${molSearchFilter.meta.smiles}`,
        function (base64Img) {
          const img = document.getElementById('componentDiagram');
          img.setAttribute('src', base64Img);
        });
    }
    $scope.searchCompleted = !!molSearchFilter;
  }
});
