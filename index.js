
export default function (kibana) {
  return new kibana.Plugin({
	  require:  ['kibana', 'elasticsearch'],
    uiExports: {
      visTypes: [
        'plugins/nlp_viz/pubmed_abstracts_vis'
      ]
    },
  
  init(server, options) {	  
    	const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
	  server.route({
		  path: '/api/elasticsearch_status/indexedit',
		  method: 'POST',
		  async handler(req, res) {
			  console.log(JSON.stringify(Object.keys(req)))
		      return callWithRequest(req, 
		    		  'index', {
		    	  "type":"doc", 
		    	  "index":"test_post", 
		    	  "body":req.payload
		    	  })
			      .then(r => res.response(r));
		  }
		});
	  
	  }
  });
}
