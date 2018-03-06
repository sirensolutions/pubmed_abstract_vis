import 'plugins/chem_search_vis/chem_search_vis.less';
import 'plugins/chem_search_vis/chem_search_vis_controller';
import exampleVisTemplate from 'plugins/chem_search_vis/chem_search_vis.html';
import exampleVisParamsTemplate from 'plugins/chem_search_vis/chem_search_vis_params.html';
import { VisVisTypeProvider } from 'ui/vis/vis_type';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';


function ExampleVisProvider(Private) {
  const VisType = Private(VisVisTypeProvider);
  const TemplateVisType = Private(TemplateVisTypeProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'chem_search',
    title: 'Siren Chemical Search',
    icon: 'fa-search',
    category: VisType.CATEGORY.KIBI,
    description: 'Allow chemical structure search',
    template: exampleVisTemplate,
    params: {
      defaults: {
        disableTimeField: true,
      },
      disableTimeField: true,
      editor: exampleVisParamsTemplate
    },
    requiresSearch: false,
    implementsRenderComplete: true,
  });
}

VisTypesRegistryProvider.register(ExampleVisProvider);

// export the provider so that the visType can be required with Private()
export default ExampleVisProvider;
