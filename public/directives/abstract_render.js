import d3 from 'd3';
import { uiModules } from 'ui/modules';
import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';
import _ from 'lodash';


const module = uiModules.get('kibana/pubmed_abstracts');

module.directive('abstractRender', function ($compile, $sce, Private) {
  return {
    restrict: 'E',
    template: '',
    scope: {
      data: '=',
      field: '=',
      nlptagsfield: '=',
      nlptagidfield: '=',
      titlefield: '=',
      tagcolor: '=',
      limit: '=',
      legendid: '='
    },
    link: function (scope, $element, attrs) {
      let queryFilter = Private(FilterBarQueryFilterProvider);


      scope.createIdFilter = function (id) {
        let idParsed = '';
        try {
          let parsed = JSON.parse(id);
          if (angular.isArray(parsed)) {
            idParsed = parsed[0];
          } else {
            idParsed = parsed;
          }
        } catch (e) {
          idParsed = id;
        }

        let filter = {
          query: {
            bool: {
              must: {
                term: {
                  _id: idParsed
                }
              }
            }
          },
          meta: {
            alias: `document id: ${idParsed}`
          }
        };
        queryFilter.addFilters([filter]);
      };

      scope.createEntityFilter = function (what) {
        const filter = {
          query: {
            bool: {
              must: [],
            }
          },
          meta: {
            alias: `${what.data_entity}: ${what.label}`
          }
        };
        const termRef = `${scope.nlptagsfield}.${what.data_entity}.${scope.nlptagidfield}`;
        const termCatRef = {};
        termCatRef[termRef] = what.ent_id;
        filter.query.bool.must.push({term: termCatRef});
        queryFilter.addFilters([filter]);
      };
      
      
   function submitEdits(document){

	   fetch('../api/elasticsearch_status/indexedit', {
           method: 'post',
           body: JSON.stringify(document),
           headers: {
               "Content-Type": "application/json",
               "kbn-xsrf": "kibana"
           }
         }).then(response => response.json())
         .then(data => console.log(data));
   }
   
   function getSubmitDocument(annotation, newtype, newval, commentdiv, docId){
	   let username = "";
	   return { 
		   docId: docId,  
	       fieldName: scope.field, 
	       username: username,
	       entity: annotation,
	       edit: {"category": newtype, "value": newval,"comment": commentdiv}
	   } 
   }
      
   function addEditPopup(span, charannotations){
      //set the popup for click
	  var annotElem = document.createElement("div")
	  annotElem.style.display = 'none'
	  annotElem.classList.add("annot");
	  span.prepend(annotElem);

	    //list each annotation cat, id, text
	    for ( const an of charannotations){
	       var adiv = document.createElement("span")
	       annotElem.appendChild(adiv)
	       
	       let catdiv = document.createElement("div")
	       catdiv.innerHTML = "Type:" + an.dict_id +'; '
	       adiv.appendChild(catdiv)
	       catdiv.classList.add("catdiv");
	       
	       let textdiv = document.createElement("div")
	       textdiv.innerHTML = 'Text: ' + scope.abstract.substring(an.start, an.end)+';&nbsp;'
	       adiv.appendChild(textdiv)
	       textdiv.classList.add("textdiv");
	       
	       let iddiv = document.createElement("div")
	       iddiv.innerHTML = 'set filter'
	       iddiv.classList.add("iddiv");
	       adiv.appendChild(iddiv)
	       
	       iddiv.addEventListener("click", function(event){
	            console.log("SET FILTER")
	       });
	       
	       let newtype = document.createElement('input'); 
	       newtype.type = "text"; 
	       newtype.classList.add("newtype");
	       newtype.placeholder = 'New type'
	       adiv.appendChild(newtype)
	       
	       let newval = document.createElement('input'); 
	       newval.type = "text"; 
	       newval.classList.add("newval");
	       newval.placeholder = 'New value'
	       adiv.appendChild(newval)
	       
	       let commentdiv = document.createElement('input'); 
	       commentdiv.type = "text"; 
	       commentdiv.classList.add("commentdiv");
	       commentdiv.placeholder = 'Comment'
	       adiv.appendChild(commentdiv)
	       
	       let submitdiv = document.createElement("button")
	       submitdiv.innerHTML = 'submit'
	       submitdiv.classList.add("submitdiv");
	       adiv.appendChild(submitdiv)
	       
	       submitdiv.addEventListener("click", function(event){
	    	    let absdiv = adiv.closest(".snippet")
	    	    let dicIdLink = absdiv.querySelector("a[data-pub-id]")
	    	    let docId = dicIdLink.getAttribute('data-pub-id')
	            submitEdits(getSubmitDocument(an, newtype.value, newval.value, commentdiv.value, docId))
	       });
	       
	    }
        span.addEventListener("click", function(event){ 
    	  annotElem.style.display = 'inline'
	    });
	    let closediv = document.createElement("button")
	    closediv.innerHTML = 'close';
	    closediv.classList.add("closediv");
	    annotElem.appendChild(closediv);
	    closediv.addEventListener("click", function(event){
	    	annotElem.style.display = "none";
	    	event.stopPropagation();
	    });
     }
      
      
      
      function addAnnotatedSpan(span, currAnnots, elem){
    	//configure and add currspan to elem
    	let cats = [...new Set(currAnnots.map(x => x.dict_id))];
    	let entids = [...new Set(currAnnots.map(x => x.ent_id))];
    	
        if(cats.length>1){
          span.setAttribute('category', 'mixed')
          span.style.backgroundColor = '#ff0066' // TODO: allow choice of default color for overlaps 
        }
        else{
          span.setAttribute('category', cats[0])
          span.style.backgroundColor = scope.tagcolor[cats[0]]
        }
        if(entids.length==1){
          span.setAttribute('ent_id', entids[0])
        }
        span.style.whiteSpace = "pre-wrap"
        span.classList.add("charspan");
    	elem.appendChild(span);
    	if (cats.length >0){
    		addEditPopup(span, currAnnots)
    	}
    	
      }
      
      

      
      function addAnnotation(text, annotations, elem) {
          // build a dict of offset to annotations
    	  var offsetAnnotations = {}
    	  for (const a of annotations) {
    	      for (var i = a.start; i < a.end; i++){ // each text char within annotation
    	         let theseAnnots = offsetAnnotations[i] || []
    	         offsetAnnotations[i] = theseAnnots
    	         theseAnnots.push(Object.assign( {}, a ))
    	      }
    	  }
    	  
    	  var currspan = document.createElement("span"); 
    	  var currAnnots = offsetAnnotations[0] || []; // start 
    	  
    	  for (const  charindex of Array(text.length).keys()) { //for each char
    	    let charannotations = offsetAnnotations[charindex.toString()] || []
    	    
    	    if(! _.isEqual(charannotations, currAnnots)){ //entering a differently annotated sequence of chars
    	    	addAnnotatedSpan(currspan, currAnnots, elem)
    	    	
    	    	//start a new span
    	    	currspan = document.createElement("span");
    	    	currAnnots = charannotations
    	    }

    	    currspan.textContent= currspan.textContent + text[charindex]

    	    
    	    if(charindex == text.length-1){
    	    	addAnnotatedSpan(currspan, currAnnots, elem)
    	    }
    	  }
    	}

      function formatAbstract() {
        d3.select($element[0]).select('.tagged-text').remove();
        d3.select($element[0]).select('br').remove();

        const absfield = scope.field;
        scope.abstract = _.get(scope, "data." + absfield);
        
        const dom = $compile(`<div class="tagged-text"></div>`)(scope);
        
        $element.append(dom);
        
        //add annotations to the text field
        
        scope.nlptags = _.get(scope, "data." + scope.nlptagsfield);
        // {'dict_id': 'disease', 'ent_id': '1234', 'start': 23, 'end': 45}
        let annots = []
        for(var dict_id in scope.nlptags){
        	  scope.nlptags[dict_id].forEach(tag => {
        	  let annot = {}
        	  annot.dict_id = dict_id
          	  annot.start = tag.start
              annot.end = tag.end
          	  annot.ent_id = tag[scope.nlptagidfield]
        	  annots.push(annot)
          });
        }
        addAnnotation(scope.abstract, annots, dom[0]);
        
        //make legend have class

        const leg_elem = $(`#${scope.legendid}`);
        leg_elem.find('span').remove();
        for (var prop in scope.tagcolor) {
          const t1 = $compile(`<span class="legenditem"   style="background-color:${scope.tagcolor[prop]}">${prop}</span>`)(scope);
          t1.attr('data-entity','');
          leg_elem.append(t1);
        }

        // Create self filter
        d3.selectAll('.publication-title')
          .on('click', function () {
            let id = d3.select(this)
              .attr('data-pub-id');
            scope.createIdFilter(id);
          }); 

        // Scan the dom elements and attach filtering behaviour
//        d3.select($element[0]).selectAll('[category]')
//          .on('click', function () {
//            const el = d3.select(this);
//            const ent_id = el.attr('ent_id');
//            const dataEntity = el.attr('category');
//            const label = el.text();
//            
//            if(Object.keys(scope.tagcolor).indexOf(dataEntity) != -1) {
//	            scope.createEntityFilter({
//	              ent_id,
//	              data_entity: dataEntity,
//	              label
//	            });
//            }
//          });
        

      }

      scope.$watch('field', function () {
        formatAbstract();
      });

      scope.$watch('nlptagsfield', function () {
        formatAbstract();
      });


      scope.$watch('nlptagidfield', function () {
        formatAbstract();
      });

      scope.$watch('titlefield', function () {
        formatAbstract();
      });


      scope.$watch('tagcolor', function () {
        formatAbstract();
      });

      scope.$watch('legendid', function () {
        formatAbstract();
      });

      formatAbstract();
    }
  };
});
