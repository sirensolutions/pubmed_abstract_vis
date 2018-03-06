export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/pubmed_abstracts_vis/pubmed_abstracts_vis'
      ]
    }

  });
}
