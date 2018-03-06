import 'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis.less';
import 'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis_controller';
import template from 'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis.html';
import paramsTemplate from 'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis_params.html';
import _ from 'lodash';
import { toJson } from 'angular';


import { VisVisTypeProvider } from 'ui/vis/vis_type';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';


function PubmedAbstractsVisProvider(Private, config) {
  const VisType = Private(VisVisTypeProvider);
  const TemplateVisType = Private(TemplateVisTypeProvider);

  console.warn('loading pubmed abstracts widget...');

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'pubmed_abstracts',
    title: 'Pubmed Abstracts',
    icon: 'fa-book',
    category: VisType.CATEGORY.SIREN,
    description: 'Display of NLP entities in pubmed abstracts',
    template,
    params: {
      editor: paramsTemplate
    },
    init: function (vis, savedSearch) {
      if (!vis.params.pageSize) {
        vis.params.pageSize = config.get('discover:sampleSize');
      }

      if (savedSearch) {
        console.warn('Saved search true in root js');
        console.log(savedSearch);
        const uiState = JSON.parse(this.uiStateJSON); // init method is called with this set to the saved visualization
        if (!uiState.sort) {
          uiState.sort = _.clone(savedSearch.sort);
          this.uiStateJSON = toJson(uiState);
        }
      }
    },
    version: 1
  });
}

VisTypesRegistryProvider.register(PubmedAbstractsVisProvider);
// export the provider so that the visType can be required with Private()
export default PubmedAbstractsVisProvider;
