export default function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/nlp_viz/pubmed_abstracts_vis'
      ]
    }

  });
}
