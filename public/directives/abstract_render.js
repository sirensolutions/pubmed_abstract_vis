import d3 from 'd3';
import { uiModules } from 'ui/modules';
import {FilterBarQueryFilterProvider} from 'ui/filter_bar/query_filter';


// const module = uiModules.get('kibana');
const module = uiModules.get('kibana/pubmed_abstracts');

module.directive('abstractRender', function ($compile, $sce, Private) {
  return {
    restrict: 'E',
    template: '',
    scope: {
      data: '=',
      field: '='
    },
    link: function (scope, $element, attrs) {
      const queryFilter = Private(FilterBarQueryFilterProvider);

      scope.createIdFilter = function (id) {
        const filter = {
          query: {
            bool: {
              filter: {
                term: {
                  pub_id: id
                }
              }
            }
          },
          meta: {
            alias: `publication id: ${id}`
          }
        };
        queryFilter.addFilters([filter]);
      };

      scope.createEntityFilter = function (what) {
        const filter = {
          query: {
            bool: {
              filter: [],
            }
          },
          meta: {
            alias: `${what.data_entity}: ${what.label}`
          }
        };

        const termCat = `text_mined_entities.nlp.tagged_entities_grouped.${what.data_entity}|${what.reference_db}.category`;
        const termRef = `text_mined_entities.nlp.tagged_entities_grouped.${what.data_entity}|${what.reference_db}.reference`;

        const termCatObj = {};
        termCatObj[termCat] = what.data_entity;

        const termCatRef = {};
        termCatRef[termRef] = what.reference;
        filter.query.bool.filter.push({term: termCatObj});
        filter.query.bool.filter.push({term: termCatRef});

        queryFilter.addFilters([filter]);
      };

      function formatAbstract() {
        d3.select($element[0]).select('.tagged-text').remove();
        scope.abstract = scope.data[scope.field];
        const dom = $compile(`<div class="tagged-text">${scope.abstract}</div>`)(scope);
        $element.append(dom);

        // Create self filter
        // d3.select($element[0]).select('.publication-title')
        // TODO: This is creating new events for all the papers every time. Should be improved (affecting to this abstract only)
        d3.selectAll('.publication-title')
          .on('click', function () {
            const id = d3.select(this)
              .attr('data-pub-id');
            scope.createIdFilter(id);
          });

        // Scan the dom elements and attach filtering behaviour
        d3.select($element[0]).selectAll('[data-entity="GENE"],[data-entity="DISEASE"],[data-entity="DRUG"],[data-entity="TARGET&DISEASE"')
          .on('click', function () {
            const el = d3.select(this);
            const reference = el.attr('reference');
            const referenceDb = el.attr('reference-db');
            const dataEntity = el.attr('data-entity');
            const label = el.text();
            scope.createEntityFilter({
              reference,
              reference_db: referenceDb,
              data_entity: dataEntity,
              label
            });
          });
      }

      scope.$watch('field', function () {
        formatAbstract();
      });

      formatAbstract();
    }
  };
});
