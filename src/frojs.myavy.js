/*!
 *  frojs is a Javascript based visual chatroom client.
 *  Copyright (C) 2015 Chase McManning <cmcmanning@gmail.com>
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

define([
    'fro'
], function(fro) {
    var MYAVY_URL = 'http://localhost:5000'; //'http://myavy.net';

    var Actor = fro.entities.Actor;

    if (typeof(Actor) !== 'function') {
        throw Error('Missing Actor entity definition');
    }

    /**
     * Entry point for the MyAvy plugin.
     *
     * @param {object} context fro instance to bind the plugin
     * @param {object} options for this plugin
     */
    function Plugin(context, options) {
        /*
            enablePicker: true,
            pickerOptions: [
                'XXXXXX',
                'http://myavy.net/XXXXXX',
            ],
            enableUploads: true,
            enableUrls: true 
        */  
        this.context = context;

        this.el = options.element || null;
        this.enableUploads = options.enableUploads || true;
        this.enableUrls = options.enableUrls || true;
        this.enablePicker = false; // options.enablePicker || false;
        this.pickerOptions = options.pickerOptions || [];

        // Ensure that there's picker options specified
        if (this.enablePicker && 
            (typeof(this.pickerOptions) !== 'object' ||
            this.pickerOptions.length < 1)) {

            throw Error(
                'MyAvy.pickerOptions must have at least ' +
                'one url if MyAvy.enablePicker is set.'
            );
        }

        if (!this.el) {
            this.el = document.createElement('div');
            document.body.appendChild(this.el);
        }

        // Generate dialog HTML based on our settings
        this.wrap();

        // Hook a listener to whenever our player changes avatars
        this.onChangeAvatar = this.onChangeAvatar.bind(this);
        context.player.bind('avatar', this.onChangeAvatar);
    }

    Plugin.prototype.createPickerHtml = function() {
        var MAX_AVATARS_PER_PAGE = 5;

        var html = 
            '<div class="page myavy-picker hidden">' +
                '<ul>';

        // Add thumbnails/links for each avatar in our options
        for (var i = 0; i < this.pickerOptions.length; i++) {
            if (i + 1 % MAX_AVATARS_PER_PAGE === 0) {
                // Start a new page
                html += '</ul><ul class="hide">';
            }

            // Add a thumbnail and link for the avatar
            // TODO: Both of those things here.
            html += '<li><a href="#"><img src="#" /></a></li>';
        }

        html += '</ul>';
        
        // If we had pages, add pagination buttons
        if (this.pickerOptions.length > MAX_AVATARS_PER_PAGE) {
            html += '<a href="#" class="prev-picker-page">Prev</a>' +
                    '<a href="#" class="next-picker-page">Next</a>';
        }

        html += '</div>';
        return html;
    };

    Plugin.prototype.createCurrentHtml = function() {

        var html = 
            '<div class="page myavy-current hidden">' +
                '<input class="current-avatar" readonly="readonly" />' +
            '</div>';

        return html;
    };

    Plugin.prototype.createUploaderHtml = function() {

        var html = 
            '<div class="page myavy-uploader hidden">' +
                '<form action="#">' +
                    '<div class="file-field input-field">' +
                        '<div class="btn">' +
                            '<span>File</span>' +
                            '<input name="avatar2" type="file" />' +
                        '</div>' +
                        '<div class="file-path-wrapper">' +
                            '<input class="file-path" type="text">' +
                        '</div>' +
                    '</div>' +
                    '<div class="error-response"></div>' +
                    '<button class="btn" type="submit">upload</button>' +
                '</form>' +
            '</div>';                    

        return html;
    };

    Plugin.prototype.createLoadUrlHtml = function() {

        var html = 
            '<div class="page myavy-url">' +
                '<form action="#">' +
                    '<input name="upload" placeholder="Enter a MyAvy avatar url" type="text" />' +
                    '<div class="error-response"></div>' +
                    '<button class="btn" type="submit">upload</button>' +
                '</form>' +
            '</div>';
        return html;
    };

    Plugin.prototype.createMainMenuHtml = function() {

        var html = '<div class="close"><a href="#">×</a></div>';

        html += '<ul class="tabs">';

        if (this.enablePicker) {
            html += '<li class="tab"><a href="#" class="show-picker" data-page="myavy-picker">Pick an avatar</a></li>';
        }

        if (this.enableUrls) {
            html += '<li class="tab active"><a href="#" class="show-url" data-page="myavy-url">Enter Url</a></li>';
        }

        if (this.enableUploads) {
            html += '<li class="tab"><a href="#" class="show-uploader" data-page="myavy-uploader">Upload</a></li>';
        }

        //html += '<li class="tab"><a href="#" class="show-current">View current avatar url</a></li>';

        html += '</ul>';

        return html;
    };

    /**
     * Generate the html for our plugin dialog. 
     */
    Plugin.prototype.wrap = function() {

        var html = this.createMainMenuHtml();

        if (this.enablePicker) {
            html += this.createPickerHtml();
        }

        if (this.enableUploads) {
            html += this.createUploaderHtml();
        }

        if (this.enableUrls) {
            html += this.createLoadUrlHtml();
        }

        this.el.className += ' myavy';
        this.el.innerHTML = html;

        var el = this.el;
        var tabs = el.querySelectorAll('.tab a');
        for (var t = 0; t < tabs.length; t++) {
            tabs[t].addEventListener('click', function(e) {
                var pages = el.querySelectorAll('.page');
                for (var p = 0; p < pages.length; p++) {
                    if (!~pages[p].className.indexOf('hidden')) {
                        pages[p].className += ' hidden';
                    }
                }

                var picked = el.querySelector('.' + this.getAttribute('data-page'));
                picked.className = picked.className.replace('hidden', '').trim();

                // Change active tab
                var active = el.querySelector('.tab.active');
                active.className = active.className.replace('active', '').trim();

                this.parentNode.className += ' active';

                e.preventDefault();
                return false;
            });
        }

        el.querySelector('input[type="file"]')
            .addEventListener('change', function(e) {

            var output = el.querySelector('.file-path');
            if (this.files.length > 0) {
                output.value = this.files[0].name;
            } else {
                output.value = '';
            }
        });

        el.querySelector('.myavy-uploader form')
            .addEventListener('submit', function(e) {

            var $form = this;
            var formData = new FormData();

            var avatar = $form.querySelector('input[type="file"]').files[0];
            formData.append('avatar', avatar);

            var $submitButton = $form.querySelector('button[type="submit"]');
            var $errorText = $form.querySelector('.error-response');
            
            $errorText.innerHTML = '';

            var xhr = new window.XMLHttpRequest();
            xhr.open('POST', MYAVY_URL, true);

            //Upload progress
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    console.log(evt.loaded + ' / ' + evt.total + ' = ' + percentComplete);

                    // Update progress bar
                    /*$progress.setAttribute(
                        'style', 'width: ' + (percentComplete * 100) + '%'
                    );*/

                    // If upload is done, change our status from 'uploading' to 'processing'
                    if (percentComplete === 1) {
                        $submitButton.innerHTML = 'converting';
                        /*$progress
                            .removeClass('determinate')
                            .removeClass('green')
                            .addClass('indeterminate')
                            .addClass('blue');*/
                    }
                }
            }, false);

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 400) {
                    try {
                        json = JSON.parse(xhr.responseText);
                    } catch (e) {
                        json = false;
                    }

                    if (json) {
                        console.log(json);
                        alert('do a thing!');
                    } else {
                        $errorText.innerHTML = 'Received an invalid response from the server';
                    }

                } else {
                    // Reached target, but there's some error

                    console.log(xhr.responseText);

                    var json;
                    try {
                        json = JSON.parse(xhr.responseText);
                    } catch (e) {
                        json = false;
                    }

                    if (json && json.code) {
                        $errorText.innerHTML = json.message;
                    } else {
                        $errorText.innerHTML = 'Received an invalid response from the server';
                    }
                }

                // Either way, reset our uploader form
                //$('#upload-progress').addClass('hide');
                $form.reset();
                $submitButton.innerHTML = 'upload';
            };

            xhr.onerror = function() {
                // Connection error
                $form.reset();
                $submitButton.innerHTML = 'upload';
                $errorText.innerHTML = 'An unspecified error has occurred.';
            };

            xhr.send(formData);

            $submitButton.innerHTML = 'uploading';

            e.preventDefault();
            return false;
        });

        el.querySelector('.myavy-url form')
            .addEventListener('submit', function(e) {

            var $form = this;
            var url = $form.querySelector('input[type="text"]').value;
            
            var $submitButton = $form.querySelector('button[type="submit"]');
            var $errorText = $form.querySelector('.error-response');
            
            $errorText.innerHTML = '';

            if (url.length < 1) {
                $errorText.innerHTML = 'You must enter a URL!';
                return;
            }

            var xhr = new window.XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 400) {
                    var json;
                    try {
                        json = JSON.parse(xhr.responseText);
                    } catch (e) {
                        json = false;
                    }

                    if (json) {
                        console.log(json);
                        alert('do a thing!');
                    } else {
                        $errorText.innerHTML = 'Received an invalid response from the server';
                    }

                } else {
                    // Reached target, but there's some error

                    console.log(xhr.responseText);

                    var json;
                    try {
                        json = JSON.parse(xhr.responseText);
                    } catch (e) {
                        json = false;
                    }

                    if (json && json.code) {
                        $errorText.innerHTML = json.message;
                    } else {
                        $errorText.innerHTML = 'Received an invalid response from the server';
                    }
                }

                // Either way, reset our uploader form
                //$('#upload-progress').addClass('hide');
                $form.reset();
                $submitButton.innerHTML = 'upload';
            };

            xhr.onerror = function() {
                // Connection error
                $form.reset();
                $submitButton.innerHTML = 'upload';
                $errorText.innerHTML = 'An unspecified error has occurred.';
            };

            xhr.send();

            $submitButton.innerHTML = 'uploading';

            e.preventDefault();
            return false;
        });

    };

    /** 
     * Add jQuery event listeners to our various components
     */
    Plugin.prototype.bindEvents = function() {

    };

    /**
     * When the player actor's avatar changes, also update
     * the URI displayed, if it was changed to an avatar with
     * an associated metadata URI.
     */
    Plugin.prototype.onChangeAvatar = function(actor) {
        // jshint unused:false
        var avatar = actor.avatar;
        

        // TODO: Grab input, update it with the avatar if it
        // has an attached URI.
    };

    // Register plugin
    fro.plugins.MyAvy = Plugin;
    return Plugin;
});
