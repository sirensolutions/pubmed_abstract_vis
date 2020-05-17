import d3 from 'd3';
import { uiModules } from 'ui/modules';
import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';
import _ from 'lodash';


// const module = uiModules.get('kibana');
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
      
      
      function addAnnotatedSpan(span, currAnnots, elem){
    	//configure and add currspan to elem//*****
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
    	elem.appendChild(span);
    	//TODO:  addEditPopup(span, charannotations)
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
    	  var currAnnots = offsetAnnotations[0] || [];
    	  
    	  for (const  charindex of Array(text.length).keys()) { //for each char
    	    let charannotations = offsetAnnotations[charindex.toString()] || []
    	    
    	    if(! _.isEqual(charannotations, currAnnots)){
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
        d3.select($element[0]).selectAll('[category]')
          .on('click', function () {
            const el = d3.select(this);
            const ent_id = el.attr('ent_id');
            const dataEntity = el.attr('category');
            const label = el.text();
            
            if(Object.keys(scope.tagcolor).indexOf(dataEntity) != -1) {
	            scope.createEntityFilter({
	              ent_id,
	              data_entity: dataEntity,
	              label
	            });
            }
          });
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
