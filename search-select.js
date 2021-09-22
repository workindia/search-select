/**
 * SearchSelect: A searchable dropdown library
 * @author Kshitij Nagvekar (https://github.com/nogoodusername)
 * @param {string} hiddenInput - Document ID of hidden input used to initialize search-select
 * @param {object} configuration - Search-Select Configuration, this set's data in search-select dropdow
 */


(function () {

    var SearchSelect = (function SearchSelect(hiddenInput, configuration) {
        /**
         * Configuration parameters 
         * 
         * `data` - Input data for dropdown
         * Expected format for `data`
         * 1. List of strings                           if label to display and value is equal
         * 2. List of objects {label: "", value: ""}    if label to display is different that value
         * 
         * `filter` - Filter criteria for dropdown search
         * Possible values for `filter`
         * 1. SearchSelect.FILTER_STARTSWITH
         * 2. SearchSelect.FILTER_CONTAINS
         * 
         * `sort` - Sort criteria for dropdown items
         * Possible values for `sort`
         * 1. underfined (don't sort)
         * 2. SearchSelect.SORT_ALPHABETIC
         * 
         * `inputClass` - Custom class to be applied to the visible input
         * 
         * `maxOpenEntries` - Maximum number of items visible when dropdown is open
         * 
         * `searchPosition` - Position of search bar input
         * Possible values for `searchPosition`
         * 1. top
         * 2. bottom
         * 
         * `dropdownPosition` - Position of dropdown
         * Possible values for `dropdownPosition`
         * 1. right
         * 2. left
         * 
         * `onInputClickCallback` - Event called when search-select input is clicked
         * 
         * `onInputKeyDownCallback` - Event called when a key is pressed in search bar
         * 
         * `onInputBlurCallback` - Callback to run when input box is out of focus
         * 
         * `hideSeparateSearchInput` - Hide the separate input search and use the same input
         * 
         * `noMatchText` - Text (HTML) to be shown if none of the options match
         */

        var _config = {
            data: [],
            filter: SearchSelect.FILTER_STARTSWITH,
            sort: undefined,
            inputClass: '',
            maxOpenEntries: 0,
            searchPosition: undefined,
            dropdownPosition: undefined,
            onInputClickCallback: undefined,
            onInputKeyDownCallback: undefined,
            onInputBlurCallback: undefined,
            hideSeparateSearchInput: true,
            noMatchText: 'No option matched.',
        };
    
        var constants = {
            optionsRowHeight: 32
        };
    
        var classList = {
            fillDismiss: 'searchSelect--FillDismiss',
            wrapper: 'searchSelect--Wrapper',
            inputResult: 'searchSelect--Result',
            optionsContainer: 'searchSelect--Options',
            inputDisplay: 'searchSelect--Display',
            options: 'searchSelect--Option',
            searchInput: 'searchSelect--SearchBar',
            noMatchField: 'searchSelect--noMatchField',
        };
    
        return function SearchSelectConstructor(hiddenInput, configuration) {
            var _this = this;
            var mContainer = undefined;
    
            var input = document.querySelector(hiddenInput);
            var clonedInput = input.cloneNode();
            var config = configuration;
    
            if (config.sort) {
                if (config.data && config.data.length > 0) {
                    if (config.data[0] instanceof String) {
                        config.data.sort(config.sort.string);
                    } else if (config.data[0] instanceof Object) {
                        config.data.sort(config.sort.object);
                    }
                }
            }
    
            _this.init = function() {
                if (typeof input.insertAdjacentElement === 'function') {
                    input.insertAdjacentElement("afterend", _this.container());
                } else {
                    input.parentNode.insertBefore(_this.container(), input.nextSibling);
                }
        
                input.addEventListener('change', _this.onInputChange);
                if(config.hideSeparateSearchInput) {
                    clonedInput.addEventListener('focus', _this.onClonedInputFocus);
                    clonedInput.addEventListener('keydown', _this.onSearchInputKeyDown);
                    clonedInput.addEventListener('keyup', _this.onSearchInputChange);
                    clonedInput.addEventListener('blur', _this.onClonedInputBlur);
                }
            };

            _this.onClonedInputFocus = function() {
                _this.toggleDropDown();
            }

            _this.onClonedInputBlur = function(e) {
                if(typeof(config.onInputBlurCallback) === "function") {
                    config.onInputBlurCallback(e);
                }
            }
    
            _this.getRandomContainerId = function() {
                return "searchSelect-" + Math.floor(Math.random() * Math.floor(5000)).toString();
            };
    
            _this.container = function () {
                var container = document.createElement('div');
                container.className = 'searchSelect';
                container.id = _this.getRandomContainerId();
    
                container.appendChild(_this.clonedInput());
                container.appendChild(_this.inputDisplay());
                container.appendChild(_this.dropDown());
                container.appendChild(_this.fillScreenDismiss());
    
                if (config.onInputClickCallback) {
                    container.addEventListener('click', config.onInputClickCallback);
                }
    
                mContainer = container;
    
                return container;
            };

            _this.clonedInput = function() {
                if(config.hideSeparateSearchInput) {
                    clonedInput.id = "cloned-input-" + hiddenInput;
                    clonedInput.hidden = false;    
                }
                return clonedInput;
            }

            _this.noMatchField = function() {
                var field = document.createElement('div');
                field.classList.add(classList.noMatchField);
                field.classList.add(classList.optionsContainer);
                field.innerHTML = config.noMatchText || 'No option matched.';
                field.style.display = 'none';
                field.addEventListener('click', function() {
                    field.blur();
                    field.style.display = 'none';
                    _this.toggleDropDown();
                })
                return field;
            }
    
            _this.inputDisplay = function () {
                var display = document.createElement('div');
                display.className = classList.inputDisplay + ' ' + config.inputClass;
    
                if (!input.disabled) {
                    display.addEventListener('click', function (ev) {
                        _this.toggleDropDown();
                    });
                } else {
                    display.classList.add('searchSelect--Display--disabled')
                }
                if (config.hideSeparateSearchInput) {
                    display.style.display = 'none';
                }
    
                var span = document.createElement('span');
                span.className = classList.inputResult + " noSelect searchSelect--Placeholder";
                span.innerHTML = input.placeholder;
    
                display.appendChild(span);
                return display;
            };
    
            _this.fillScreenDismiss = function () {
                var fill = document.createElement('div');
                fill.className = 'searchSelect--FillDismiss--hidden ' + classList.fillDismiss;
    
                fill.addEventListener('click', _this.toggleDropDown);
    
                return fill;
            };
    
            _this.dropDown = function () {
                var wrapper = document.createElement('div');
    
                if (config.dropdownPosition === 'right') {
                    wrapper.className = 'searchSelect--Wrapper--hidden searchSelect--Wrapper--right ' + classList.wrapper;
                } else {
                    wrapper.className = 'searchSelect--Wrapper--hidden ' + classList.wrapper;
                }
    
                var dropdown = _this.dropDownContent();
    
                wrapper.appendChild(dropdown);
                return wrapper;
            };
    
            _this.dropDownContent = function() {
                var dropdown = document.createElement('div');
                dropdown.className = 'searchSelect--Dropdown';

                dropdown.appendChild(_this.noMatchField())
    
                var optionsList = document.createElement('ul');
                optionsList.className = classList.optionsContainer;
                optionsList.style.maxHeight = (config.maxOpenEntries * constants.optionsRowHeight) + "px";
    
                var options = _this.options(config.data);
                for (var i = 0; i < options.length; i ++) {
                    optionsList.appendChild(options[i]);
                }
    
                var search = document.createElement('div');
                search.className = 'searchSelect--Search';
    
                if (config.searchPosition === 'top') {
                    search.classList.add('searchSelect--Search--top');
                } else {
                    search.classList.add('searchSelect--Search--bottom');
                }

                if (config.hideSeparateSearchInput) {
                    search.style.display = 'none';
                }
    
                var searchInput = _this.searchInput();
    
                var searchIcon = document.createElement('span');
                searchIcon.className = 'searchSelect--SearchBarIcon';
    
                search.appendChild(searchInput);
                search.appendChild(searchIcon);
    
                if (config.searchPosition === 'top') {
                    dropdown.appendChild(search);
                    dropdown.appendChild(optionsList);
                } else {
                    dropdown.appendChild(optionsList);
                    dropdown.appendChild(search);
                }
    
                return dropdown;
            };
    
            _this.searchInput = function() {
                var searchInput = document.createElement('input');
                searchInput.className = 'form-control mobile-field ' + classList.searchInput;
                searchInput.type = 'search';
                searchInput.tabIndex = 0;
    
                if (input) {
                    var search_placeholder = input.getAttribute('data-search-placeholder');
    
                    if (search_placeholder) {
                        searchInput.placeholder = search_placeholder;
                    }
                }
    
                searchInput.addEventListener('keydown', _this.onSearchInputKeyDown);
                searchInput.addEventListener('keyup', _this.onSearchInputChange);
    
                return searchInput;
            };
    
            _this.onInputChange = function(event) {
                var target = event.target;
    
                if (target.value) {
                    var preset = _this.querySelector('.' + classList.options + '[data-value="' + target.value + '"]');
                    if (preset) {
                        _this.resetOptionSelect();
                        preset.classList.add('searchSelect--Option--selected');
                        _this.querySelector('.' + classList.inputResult).innerHTML = preset.innerHTML;
                        _this.querySelector('.' + classList.inputResult).classList.remove('searchSelect--Placeholder');
                    }
                } else {
                    _this.resetOptionSelect();
                    _this.querySelector('.' + classList.inputResult).innerHTML = input.placeholder;
                    _this.querySelector('.' + classList.inputResult).classList.add('searchSelect--Placeholder');
                }
            };
    
            _this.toggleDropDown = function () {
                _this.querySelector('.' + classList.wrapper).classList.toggle('searchSelect--Wrapper--hidden');
                _this.querySelector('.' + classList.fillDismiss).classList.toggle('searchSelect--FillDismiss--hidden');
    
                if (!_this.querySelector('.' + classList.wrapper). classList.contains('searchSelect--Wrapper--hidden')) {
                    if(!config.hideSeparateSearchInput) {
                        _this.querySelector('.' + classList.searchInput).focus();
                    }
                }
    
                _this.querySelector('.' + classList.searchInput).value = null;
                _this.querySelector('.' + classList.searchInput).dispatchEvent(_this.createEvent('keyup'));
            };
    
            _this.onSearchInputKeyDown = function(event) {
                var c = event.keyCode;
    
                if (c === 13) {
                    event.preventDefault();
    
                    var currentSelectedOption = _this.querySelector('.' + classList.options + '.searchSelect--Option--selected:not(.searchSelect--Option--hidden)');
    
                    if (!currentSelectedOption) {
                        if (_this.querySelector('.' + classList.options + ':not(.searchSelect--Option--hidden)')) {
                            _this.querySelector('.' + classList.options + ':not(.searchSelect--Option--hidden)').click();
                        }
                    } else {
                        _this.toggleDropDown();
                    }
                    clonedInput.blur();
                } else if (c === 27) {
                    _this.toggleDropDown();
                } else if (c === 38 || c === 40) {
                    event.preventDefault();
                    _this.navigateOptions(c===38?'previous':'next');
                } else {
                    input.value = "";
                }
    
                if (config.onInputKeyDownCallback) {
                    config.onInputKeyDownCallback(event);
                }
            };
    
            _this.onSearchInputChange = function(event) {

                var c = event.keyCode;
                if (c === 38 || c === 40) return; // stop up down for input change
                
                var target = event.target;
                var keyword = target.value;
                var options = _this.querySelectorAll('.' + classList.options);

                var visibleOptionsCount = 0;
    
                for (var i = 0; i < options.length; i++) {
                    if (config.filter(options[i].innerHTML, keyword)) {
                        options[i].classList.remove('searchSelect--Option--hidden');
                        visibleOptionsCount++;
                    } else {
                        options[i].classList.add('searchSelect--Option--hidden');
                    }
                }

                var noMatchField = _this.querySelectorAll('.' + classList.noMatchField);
                var wrapper = _this.querySelector('.' + classList.wrapper);
                if(noMatchField && noMatchField.length > 0) {
                    if(visibleOptionsCount == 0) {
                        noMatchField[0].style.display = 'block';
                        // wrapper.classList.add('searchSelect--Wrapper--hidden');
                    } else {
                        noMatchField[0].style.display = 'none';
                        // wrapper.classList.remove('searchSelect--Wrapper--hidden');
                    }
                }
            };
    
            _this.navigateOptions = function(direction) {
                var currentSelectedOption = _this.querySelector('.' + classList.options + '.searchSelect--Option--selected:not(.searchSelect--Option--hidden)');
    
                if (currentSelectedOption) {
                    var activeOptions = _this.querySelectorAll('.' + classList.options + ':not(.searchSelect--Option--hidden)');
    
                    for (var i = 0; i < activeOptions.length; i++) {
                        if (activeOptions[i] === currentSelectedOption) {
                            if (direction === 'previous') {
                                if (activeOptions[i-1]) {
                                    _this.selectOption(activeOptions[i-1]);
                                }
                            } else {
                                if (activeOptions[i+1]) {
                                    _this.selectOption(activeOptions[i+1]);
                                }
                            }
                        }
                    }
    
                } else {
                    _this.selectOption(_this.querySelector('.' + classList.options + ':not(.searchSelect--Option--hidden)'));
                }
    
            };
    
            _this.options = function (dataArray) {
                var options = [];
    
                for (var i=0; i < dataArray.length; i++) {
                    var option = document.createElement('li');
                    option.className = classList.options + ' noSelect';

                    var subtext = document.createElement('span');
                    subtext.classList.add('searchSelect--Option-subtext');
    
                    if (typeof dataArray[i] === 'string' || dataArray[i] instanceof String) {
                        option.setAttribute('data-value', dataArray[i]);
                        option.setAttribute('data-label', dataArray[i]);
                        option.setAttribute('data-input', input.id);
                        option.innerHTML = dataArray[i];
    
                        option.addEventListener('click', _this.optionClick);
                        option.addEventListener('mouseover', _this.resetOptionSelect);
    
                        options.push(option);
                    } else if (typeof dataArray[i] === 'object' || dataArray[i] instanceof Object) {
                        option.setAttribute('data-value', dataArray[i].value);
                        option.setAttribute('data-label', dataArray[i].label);
                        option.setAttribute('data-input', input.id);
                        option.innerHTML = dataArray[i].label;
    
                        option.addEventListener('click', _this.optionClick);
                        option.addEventListener('mouseover', _this.resetOptionSelect);

                        if(dataArray[i].subtext) {
                            subtext.innerHTML = dataArray[i].subtext;
                        }

                        option.insertAdjacentElement('beforeend', subtext);
    
                        options.push(option);
                    }
                }
    
                return options;
            };
    
            _this.optionClick = function(event) {
                var target = event.target;
    
                _this.selectOption(target);
                _this.toggleDropDown();
            };
    
            _this.selectOption = function(option) {
                _this.resetOptionSelect();
                option.classList.add('searchSelect--Option--selected');
                _this.scrollParentToChild(option.parentNode, option);
    
                var _value = option.getAttribute('data-value');
                var _label = option.getAttribute('data-label');
           
                input.value = _value;
                clonedInput.value = _label;
                input.dispatchEvent(_this.createEvent('change'));
                _this.querySelector('.' + classList.inputResult).innerHTML = _label;
            };
    
            _this.resetOptionSelect = function() {
                var options = _this.querySelectorAll('.' + classList.options);
    
                for (var i = 0; i < options.length; i++) {
                    options[i].classList.remove('searchSelect--Option--selected');
                }
            };
    
            _this.scrollParentToChild = function(parent, child) {
                parent.scrollTop = child.offsetTop - parent.clientHeight + child.clientHeight;
            };
    
            _this.setData = function(data) {
                var wrapper = _this.querySelector('.' + classList.wrapper);
                wrapper.innerHTML = "";
                config.data = data;
    
                var dropdown = _this.dropDownContent();
    
                wrapper.appendChild(dropdown);
            };
    
            _this.getData = function () {
                return config.data;
            };

            _this.setClonedInput = function(value, placeholder="") {
                clonedInput.value = value;
                if (placeholder) {
                    clonedInput.placeholder = placeholder;
                }

            }
    
            _this.getContainer = function () {
                return mContainer;
            };
    
            _this.getSearchInput = function () {
                return _this.querySelector('.' + classList.searchInput);
            };
    
            _this.openDropdown = function (focus) {
                if (focus && !config.hideSeparateSearchInput) {
                    _this.querySelector('.' + classList.searchInput).focus();
                }
    
                if (_this.querySelector('.' + classList.wrapper). classList.contains('searchSelect--Wrapper--hidden')) {
                    _this.querySelector('.' + classList.inputDisplay).click();
                }
            };
    
            _this.closeDropdown = function () {
                if (!_this.querySelector('.' + classList.wrapper). classList.contains('searchSelect--Wrapper--hidden')) {
                    _this.querySelector('.' + classList.inputDisplay).click();
                }
            };
    
            _this.querySelector = function (query) {
                return mContainer.querySelector(query);
            };
    
            _this.querySelectorAll = function (query) {
                return mContainer.querySelectorAll(query);
            };
    
            _this.createEvent = function (eventName) {
                var event;
    
                if (typeof (Event) === 'function') {
                    event = new Event(eventName);
                } else {
                    event = document.createEvent('Event');
                    event.initEvent(eventName, true, true);
                }
    
                return event;
            };
    
            // INIT
            _this.init();
    
            return _this;
        }
    }());
    
    SearchSelect.FILTER_CONTAINS = function(text, input) {
        return RegExp(SearchSelect.RegExpEscape(input.trim()), "i").test(text);
    };
    
    SearchSelect.FILTER_STARTSWITH = function(text, input) {
        return RegExp("^" + SearchSelect.RegExpEscape(input.trim()), "i").test(text);
    };
    
    SearchSelect.SORT_ALPHABETIC = {
        string: function (a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        },
        object: function (a, b) {
            var a = a.label.toUpperCase();
            var b = b.label.toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        }
    };
    
    SearchSelect.RegExpEscape = function(s) {
        return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    
    if (typeof self !== "undefined") {
        self.SearchSelect = SearchSelect;
    }
    
    return SearchSelect;
    
    }());