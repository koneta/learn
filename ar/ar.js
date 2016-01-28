/*@Author AnLT */
jQuery.namespace('$.qp.ar');
$.qp.ar = (function($$module){
	var CONST = {
			ATTR_PRECHECK_CALLBACK : "data-ar-precheck",
			ATTR_FINISHED_CALLBACK : "data-ar-callback",
			ATTR_INDEXCHANGE_CALLBACK : "data-ar-indexchange",
			ATTR_MAXIMUM_ROWS : "data-ar-mrows",
			ATTR_IGNORE_ROWS : "data-ar-irows",
			ATTR_ROW_GROUPID : "data-ar-rgroup",
			ATTR_ROW_GROUPINDEX : "data-ar-rgroupindex",
			ATTR_ROW_TEMPLATE : "data-ar-templateid",
			ATTR_ROW_INDEX : "data-ar-rindex",
			DIRECTION_ADD : "add",
			DIRECTION_REMOVE : "remove",
			ANCHOR_STRING_BEFORE : "before",
			ANCHOR_STRING_AFTER : "after",
			ANCHOR_STRING_INSIDE_BEGIN : "inside-begin",
			ANCHOR_STRING_INSIDE_END : "inside-end",
			REMOVE_TYPE_ALL :"all",
			REMOVE_TYPE_ONLYDESC: "onlyDescendants",
			AR_CLASS_GROUPINDEX: "ar-groupIndex",
			AR_CLASS_RINDEX: "ar-rIndex",
			AR_CLASS_GROUPID: "ar-groupId",
			ARR_REINDEX_ATTRIBUTES : ["name","id","for","href"]
	};
	$$module.CONST=CONST;
	$$module.addRow = function(param) {
		var $container = param.container;
		var $template = null;
		var $newRow = null;
		var templateData = param.templateData || {};
		if(!$container){
			if(!param.tableId) {
				$container = $(param.link).closest("div").prev("table");
			} else {
				$container = $("#"+param.tableId);
			}
		} else {
			$container = $($container);
		}
		if($container!="undefined") {
			var ignoreRows = parseInt($container.attr(CONST.ATTR_IGNORE_ROWS));
			if(isNaN(ignoreRows)) {
				ignoreRows = 0;
			}
			var maxRows = parseInt($container.attr(CONST.ATTR_MAXIMUM_ROWS));
			if(isNaN(maxRows)) {
				maxRows = 200;
			}
			var precheckFunction = $container.attr(CONST.ATTR_PRECHECK_CALLBACK);
			var passCheck = true;
			if(typeof $.namespace(precheckFunction)=="function"){
				passCheck = $.namespace(precheckFunction)($container,param.link,CONST.DIRECTION_ADD);
			}
			if($container.is("table") & !param.position){
				param.position = {anchor:'>tbody',string:CONST.ANCHOR_STRING_INSIDE_END};
				if($container.find(">tbody>*").length-ignoreRows >= maxRows) {
					passCheck = false;
				}
				if($container.find(">tbody").length==0){
					$container.append($("<tbody>"))
				}
			} 
			if(!param.templateId) {
				if($container.attr("data-ar-rowTemplateId")){
					$template = $("#" + $container.attr("data-ar-rowTemplateId"));
				} else {
					$template = $("#" + $container.attr("id") + "-template");
				}
			} else {
				$template = $("#"+param.templateId);
			}
			$newRow = $template.tmpl(templateData);
			if(passCheck && $newRow.toString()){
				var callback = $container.attr(CONST.ATTR_FINISHED_CALLBACK);
				var templateId = $template.attr("id");
				if(!templateId){
					templateId = '';
				}
				$newRow.attr(CONST.ATTR_ROW_TEMPLATE, templateId);
				if(!$newRow.attr(CONST.ATTR_ROW_GROUPID)){
					$newRow.attr(CONST.ATTR_ROW_GROUPID,"");
				}
				switch(param.position.string){
				case CONST.ANCHOR_STRING_BEFORE:
					$container.find(param.position.anchor).before($newRow);
					break;
				case CONST.ANCHOR_STRING_AFTER:
					$container.find(param.position.anchor).after($newRow);
					break;
				case CONST.ANCHOR_STRING_INSIDE_END:
					$container.find(param.position.anchor).append($newRow);
					break;
				case CONST.ANCHOR_STRING_INSIDE_BEGIN:
					$container.find(param.position.anchor).prepend($newRow);
					break;
				}
				$$module.recalculateRowIndex($container,param.indexClass,templateData.groupId);
				$$module.renameAttributes($container);
				$$module.callbackDefault($container,CONST.DIRECTION_ADD,$newRow,param);
				if(typeof $.namespace(callback)=="function"){
					$.namespace(callback)($container,CONST.DIRECTION_ADD,$newRow,param);
				}
			}
		}
		return $newRow;
	};

	$$module.removeRow = function(param) {
		var $container;
		if(!$.contains($(param.container),$(param.link))){
			$container = $(param.link).closest("table");
		} else {
			$container = $(param.container);
		}
		
		var callback = $container.attr(CONST.ATTR_FINISHED_CALLBACK);
		var ignoreRows = parseInt($container.attr(CONST.ATTR_IGNORE_ROWS));
		if (isNaN(ignoreRows)) {
			ignoreRows = 0;
		}
		var $removeRow = $(param.link).closest("tr");
		var precheckFunction = $container.attr(CONST.ATTR_PRECHECK_CALLBACK);
		var passCheck = true;
		if(typeof $.namespace(precheckFunction)=="function"){
			passCheck = $.namespace(precheckFunction)($container,param.link,CONST.DIRECTION_REMOVE,$removeRow);
		}
		if(passCheck){
			if(param.removeType && param.removeType!=CONST.REMOVE_TYPE_ALL){
				if(param.removeType == CONST.REMOVE_TYPE_ONLYDESC){
					$container.find("["+CONST.ATTR_ROW_GROUPID+"^='"+$removeRow.attr(CONST.ATTR_ROW_GROUPINDEX)+"']").remove();
				}
			} else {
				$container.find("["+CONST.ATTR_ROW_GROUPID+"^='"+$removeRow.attr(CONST.ATTR_ROW_GROUPINDEX)+"']").remove();
				$removeRow.remove();
			}
			
			var templateId = $removeRow.attr(CONST.ATTR_ROW_TEMPLATE);
			if(!templateId) {
				$template = $("#" + $container.attr("id") + "-template");
			} else {
				$template = $("#"+templateId);
			}
			
			var $newRow ;
			if (param.isReserved) {
				if ($container.find("tr").size() <= ignoreRows) {
					$newRow = $template.tmpl();
					$newRow.attr(CONST.ATTR_ROW_TEMPLATE,$removeRow.attr(CONST.ATTR_ROW_TEMPLATE));
					$container.append($newRow);
				}
			}
			$$module.callbackDefault($container,CONST.DIRECTION_REMOVE,$removeRow);
			if(typeof $.namespace(callback)=="function"){
				$.namespace(callback)($container,CONST.DIRECTION_REMOVE,$removeRow,param);
			}
			$$module.recalculateRowIndex($container,$removeRow.attr(CONST.ATTR_ROW_GROUPID));
			$$module.renameAttributes($container);
			if (param.isReserved) {
				if ($newRow) {
					$$module.callbackDefault($container,CONST.DIRECTION_ADD,$newRow,param);
					if(typeof $.namespace(callback)=="function"){
						$.namespace(callback)($container,CONST.DIRECTION_ADD,$newRow,param);
					}
				}
			}
		}
		return $removeRow;
	};
	$$module.recalculateRowIndex = function(table,groupId) {
		$container=$(table);
		var ignoreRows = parseInt($container.attr(CONST.ATTR_IGNORE_ROWS));
		var rowIndexClass;
		var indexChangeCallback = $container.attr(CONST.ATTR_INDEXCHANGE_CALLBACK);
		if(isNaN(ignoreRows)) {
			ignoreRows = 0;
		}
		
		
		if(!rowIndexClass){
			rowIndexClass = CONST.AR_CLASS_RINDEX;
		}
		
		$container.find(">tbody>tr").each(function(i) {
			if(i>=ignoreRows){
				$(this).attr(CONST.ATTR_ROW_INDEX,i-ignoreRows);
				$(this).find("input."+rowIndexClass).val(i+1);
			}
		});
		
		$$module.recalculateGroupIndex($container.find(">tbody>tr"),groupId,indexChangeCallback);
	};
	$$module.recalculateGroupIndex = function(groupScope,groupId,indexChangeCallback){
		var $groupScope = $(groupScope);
		if(!groupId){
			groupId = '';
		}
		var indexPrefix=groupId;
		if(indexPrefix){
			indexPrefix += '.';
		}
		
		var inGroupSelector;
		if(groupId){
			inGroupSelector = "tr[data-ar-rgroup='"+groupId+"']";
		} else {
			inGroupSelector = "tr[data-ar-rgroup=''],tr:not([data-ar-rgroup])";
		}
		
		$groupScope.filter(inGroupSelector).each(function(i) {
			var currentRow = this;
			if(typeof $.namespace(indexChangeCallback)=="function"){
				 $.namespace(indexChangeCallback)($groupScope,this,$(this).attr("data-ar-rgroupindex"),indexPrefix+(i+1));
			}
			var $scope = $(this).nextAll("tr[data-ar-rgroup='"+$(this).attr(CONST.ATTR_ROW_GROUPINDEX)+"']");
			$scope.attr(CONST.ATTR_ROW_GROUPID,indexPrefix+(i+1));
			$(this).attr("data-ar-rgroupindex",indexPrefix+(i+1));
			$(this).find("td."+CONST.AR_CLASS_GROUPINDEX).each(function(){
				if($(this).closest("tr").is(currentRow)){
					$(this).html(indexPrefix+(i+1));
				}
			});
			$(this).find("span."+CONST.AR_CLASS_GROUPINDEX).each(function(){
				if($(this).closest("tr").is(currentRow)){
					$(this).html(indexPrefix+(i+1));
				}
			});
			$(this).find("input."+CONST.AR_CLASS_GROUPID).each(function(){
				if($(this).closest("tr").is(currentRow)){
					$(this).val(groupId);
				}
			});
			$(this).find("input."+CONST.AR_CLASS_GROUPINDEX).each(function(){
				if($(this).closest("tr").is(currentRow)){
					$(this).val(indexPrefix+(i+1));
				}
			});
			$$module.recalculateGroupIndex($scope,$(this).attr(CONST.ATTR_ROW_GROUPINDEX),indexChangeCallback);
		});
	};
	$$module.renameAttributes = function(table) {
		$container=$(table);
		var dataClass = $container.attr("data-ar-dataClass");
		var dataSelector = ">tbody>tr";
		if(dataClass){
			dataSelector += "."+dataClass;
		}
		var ignoreRows = parseInt($container.attr(CONST.ATTR_IGNORE_ROWS));
		var tableTreeLevel = parseInt($container.attr("data-ar-tlevel"));
		if(isNaN(ignoreRows)) {
			ignoreRows = 0;
		}
		if(isNaN(tableTreeLevel)) {
			tableTreeLevel = 0;
		}
		var regex = /\[\d*\]/g;
		
		if(!CONST.ARR_REINDEX_ATTRIBUTES){
			CONST.ARR_REINDEX_ATTRIBUTES = ["name"];
		}
		var attributesName;
		for(var i=0;i<CONST.ARR_REINDEX_ATTRIBUTES.length;i++){
			attributesName = (attributesName?attributesName+", ":"") + "[" +CONST.ARR_REINDEX_ATTRIBUTES[i]+"*='[']["+CONST.ARR_REINDEX_ATTRIBUTES[i]+"*='].']";
		}
		
		$container	.find(dataSelector)
					.each(function(i) {
							if(i>=ignoreRows) {
								var replacements = [];
								var tempTable = $container;
								
								for(var j=tableTreeLevel-1;j>-1;j--) {
									tempTable=$(tempTable).parents("[data-ar-tlevel="+j+"]:first");
									replacements[j] ='[' + tempTable.parents("tr:first").attr(CONST.ATTR_ROW_INDEX)+ ']';
								}
								$(this)	.find(attributesName)
										.each(function() {
											for(var j in CONST.ARR_REINDEX_ATTRIBUTES){
												if($(this).attr(CONST.ARR_REINDEX_ATTRIBUTES[j])){
													var matches = $(this).attr(CONST.ARR_REINDEX_ATTRIBUTES[j]).match(regex);
													if (matches && matches[tableTreeLevel]!='undefined') {
														var index=0;
														$(this).attr(CONST.ARR_REINDEX_ATTRIBUTES[j],$(this).attr(CONST.ARR_REINDEX_ATTRIBUTES[j]).replace(regex,function(match,stringIndex){
															var replacement = "[]";
															if(index==tableTreeLevel){
																replacement = '[' + (i-ignoreRows) + ']';
															} else {
																if(index>tableTreeLevel){
																	replacement =  match;
																} else replacement=replacements[index];
															}
															index++;
															return replacement;
														}));
													}
												}
											}
										});
							}
					});
	};
	$$module.callbackDefault = function(){};
	$$module.init = function(){
		$(function(){
		});
	};
	return $$module;
})(jQuery.namespace('$.qp.ar'));
$.qp.ar.init();