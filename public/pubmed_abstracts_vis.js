import 'plugins/nlp_viz/pubmed_abstracts_vis.less';
import 'plugins/nlp_viz/pubmed_abstracts_vis_controller';
import template from 'plugins/nlp_viz/pubmed_abstracts_vis.html';
import 'plugins/nlp_viz/pubmed_abstracts_vis_params';
import _ from 'lodash';
import { toJson } from 'angular';


import { VisVisTypeProvider } from 'ui/vis/vis_type';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';


function PubmedAbstractsVisProvider(Private, config) {
  const VisType = Private(VisVisTypeProvider);
  const TemplateVisType = Private(TemplateVisTypeProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'pubmed_abstracts',
    title: 'NLP Highlighter',
    icon: 'fa-highlighter',
    category: VisType.CATEGORY.TEXTUAL,
    description: 'Display of NLP entities in tagged text',
    template,
    params: {
      defaults: {
        field: '',
        nlptagsfield: '',
        nlptagtypefield: '',
        nlptagidfield: '',
        titlefield: '',
        tagcolor: '',
        limit: ''
      },
      editor: '<pubmed-abstracts-vis-params></pubmed-abstracts-vis-params>'
    },

    init: function (vis, savedSearch) {
//      if (!vis.params.limit) {
//        vis.params.limit = config.get('discover:sampleSize');
//      }
      if(! vis.params.legendid){
          vis.params.legendid = (Math.floor(Math.random() * (10000000 - 1000000 + 1)) + 1000000);
      }


      if (savedSearch) {
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
