/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';





/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["/bower_components/anypoint-styles/anypoint-styles.html","e584adafd34699dd90e18a97c52bd033"],["/bower_components/anypoint-styles/colors.html","417372e96fb8ada00e2ae0e79e955ade"],["/bower_components/anypoint-styles/din-pro.html","f36a651ab9818ec11e2c165e1c66240f"],["/bower_components/anypoint-styles/typography.html","dd38d453fc0fc895756445a2afa4c02c"],["/bower_components/api-console-ext-comm/api-console-ext-comm.html","e72c96a1e2d201e5e0640b93169eb169"],["/bower_components/app-layout/app-drawer-layout/app-drawer-layout.html","a7474857c8dd25d6a9e5aabe763ec01f"],["/bower_components/app-layout/app-drawer/app-drawer.html","6542c3b2545aa1f93c16a6ff04c47c0b"],["/bower_components/app-layout/app-header-layout/app-header-layout.html","0916d57aa30b3c1b54946399c8c01f04"],["/bower_components/app-layout/app-header/app-header.html","f5c92182d2100c582b099fdba4b1267f"],["/bower_components/app-layout/app-scroll-effects/app-scroll-effects-behavior.html","3007817ffcb7fd1cf6528305c0fec9ff"],["/bower_components/app-layout/app-scroll-effects/app-scroll-effects.html","1eaa9e05144414be49e4ee23e16ceca2"],["/bower_components/app-layout/app-scroll-effects/effects/blend-background.html","4723ce7f6429640a812ad866ddddb719"],["/bower_components/app-layout/app-scroll-effects/effects/fade-background.html","3929482c600a21680def557965850501"],["/bower_components/app-layout/app-scroll-effects/effects/material.html","271fe6e745f1a9581a6e01cb3aadce21"],["/bower_components/app-layout/app-scroll-effects/effects/parallax-background.html","391d025dcffee3f042c9d2bdd83be377"],["/bower_components/app-layout/app-scroll-effects/effects/resize-snapped-title.html","4f3bc3dee2d48426998c6e4425df2b14"],["/bower_components/app-layout/app-scroll-effects/effects/resize-title.html","a78d5b787591fb1728631fc5e087cd1c"],["/bower_components/app-layout/app-scroll-effects/effects/waterfall.html","6cbd757de769cd5af213aaebb8780745"],["/bower_components/app-layout/app-toolbar/app-toolbar.html","bde0a79d3265bef565ee86c699b6bbae"],["/bower_components/app-layout/helpers/helpers.html","95b52c0c05f77b65bc1b5dc0715d2495"],["/bower_components/app-route/app-location.html","0c082f44abb664591f5b99e57a3855e6"],["/bower_components/app-route/app-route-converter-behavior.html","3b85a02b434cbccdcb87396be3554258"],["/bower_components/app-route/app-route.html","ee6897a01647904badcc856c1a4cb6ec"],["/bower_components/arc-definitions/arc-definitions.html","85824e3d3444bdf673a9dd18e9dea943"],["/bower_components/arc-icons/arc-icons.html","909ae34db90b5b240ce5d33c5851f140"],["/bower_components/auth-methods/auth-method-basic.html","f9d65fe800aa8f05930de749f1a08b9c"],["/bower_components/auth-methods/auth-method-digest.html","d63debb2c7a0b398652eb3099ed88ed7"],["/bower_components/auth-methods/auth-method-ntlm.html","493088b3effd5bf5332646a19fa93fda"],["/bower_components/auth-methods/auth-method-oauth1.html","bf3c8b835bccc5c669e86541342b6cf4"],["/bower_components/auth-methods/auth-method-oauth2.html","7e7115cb8ed927dec50631ef733c2c25"],["/bower_components/auth-methods/auth-methods-behavior.html","f75e3558e605a6d9819be3b415f3ef90"],["/bower_components/auth-methods/auth-methods-styles.html","8a4efe8653650ed50a0787063d129303"],["/bower_components/auth-methods/auth-methods.html","7e76a0b0f60bed3615d240cf44b54094"],["/bower_components/auth-methods/cryptojs-import.html","120f21756fd337b0673bd6f7a9354721"],["/bower_components/auth-methods/polyfills.html","af39ddac2975932f58bd01d46f11fbf4"],["/bower_components/authorization-panel/authorization-panel.html","d4291af6d81e1bcc5355b6ac94e7d789"],["/bower_components/body-form-editor/body-form-editor.html","d8583f95eade6ebdbc9033d666985e91"],["/bower_components/body-json-editor/body-json-editor-behavior.html","ee8ed352062e91e0250d37496373adba"],["/bower_components/body-json-editor/body-json-editor.html","867426bb4cfec41f3616a2d98a8ac67c"],["/bower_components/body-json-editor/object-editor.html","d42a3b38f422a9fb0f528f96f29f22d4"],["/bower_components/body-json-editor/simple-type-editor.html","11f64899f101276ba54ed8b113680906"],["/bower_components/clipboard-copy/clipboard-copy.html","b272640d50d335d1c7222f3c460fd13a"],["/bower_components/code-mirror/code-mirror.html","da078f93749d810171b8287af6d6e12f"],["/bower_components/code-mirror/code-mirror.js","ccb3a8562e8dde311eb3e3555792279b"],["/bower_components/code-mirror/codemirror-import.html","0e7d9ef014c4c4819796bba68ab02c25"],["/bower_components/code-mirror/styles/3024-day-styles.html","b985602d6542776da82383fc47cb0e3b"],["/bower_components/code-mirror/styles/3024-night-styles.html","54c40cfd0f460f9c419792c2631525b2"],["/bower_components/code-mirror/styles/ambiance-mobile-styles.html","c9e4ad1a081fd86fcd84787f1a5f5083"],["/bower_components/code-mirror/styles/ambiance-styles.html","ac0285940410e79eb624b5beae9b2f7d"],["/bower_components/code-mirror/styles/base16-dark-styles.html","3163a372020325448d5d8c04ad3f23a0"],["/bower_components/code-mirror/styles/base16-light-styles.html","5b0a82fa682635cc5a580c7a0ff31fbe"],["/bower_components/code-mirror/styles/blackboard-styles.html","0465045a6de537268708da2dbdfa6bc0"],["/bower_components/code-mirror/styles/cobalt-styles.html","5fc838f30c9a1f6ce193fe36481eb12a"],["/bower_components/code-mirror/styles/codemirror-styles.html","cfa034b22b137ba0020357f87f8fd754"],["/bower_components/code-mirror/styles/colorforth-styles.html","36078c64a6940ec64a3ee6512feaaf4e"],["/bower_components/code-mirror/styles/eclipse-styles.html","0795336fe2b87cc17d662a89c4cebc85"],["/bower_components/code-mirror/styles/elegant-styles.html","0dd97d55061a5cfb109fd42796468842"],["/bower_components/code-mirror/styles/erlang-dark-styles.html","cc27845618f95c7fc0a7c4abc53fa530"],["/bower_components/code-mirror/styles/lesser-dark-styles.html","c32d46b2a0dff46054490885ebf98ef1"],["/bower_components/code-mirror/styles/liquibyte-styles.html","38524b3e9bf598d35b5d1fb195dbb926"],["/bower_components/code-mirror/styles/mbo-styles.html","5d332cdb1621a7276a0d85d230f3270d"],["/bower_components/code-mirror/styles/mdn-like-styles.html","98b778556ede0013f12fea6f2ba6663a"],["/bower_components/code-mirror/styles/midnight-styles.html","441dca2632dc775efa80642fad6254a5"],["/bower_components/code-mirror/styles/monokai-styles.html","81446baf66034eec7e57cfbd10518394"],["/bower_components/code-mirror/styles/neat-styles.html","ec6d8846a03ded43b4a9583a5e762307"],["/bower_components/code-mirror/styles/neo-styles.html","a7df507bbf5f33cb33d3b369dcc85b43"],["/bower_components/code-mirror/styles/night-styles.html","dd48f25d2153614d8f537f335cb99e31"],["/bower_components/code-mirror/styles/paraiso-dark-styles.html","6bf2c1d10fe71335b68fc7ddd4923cf8"],["/bower_components/code-mirror/styles/paraiso-light-styles.html","27ead6746fa8e17d025bc892514fbd9d"],["/bower_components/code-mirror/styles/pastel-on-dark-styles.html","f1745773022efd8e3ed6d6248f7905dd"],["/bower_components/code-mirror/styles/rubyblue-styles.html","1c692750217822b058a1f0417d780eac"],["/bower_components/code-mirror/styles/solarized-styles.html","e3beecdbecc9a6ef1dae06f4c66b34f4"],["/bower_components/code-mirror/styles/the-matrix-styles.html","73cf2bb2d0689ec25bac3b1dcec33b65"],["/bower_components/code-mirror/styles/tomorrow-night-bright-styles.html","febb8bd0a1c87e422b4373d36749c9ad"],["/bower_components/code-mirror/styles/tomorrow-night-eighties-styles.html","fc458d98bc0ba272c88883db41a28b10"],["/bower_components/code-mirror/styles/ttcn-styles.html","f6adc6f42be6409c4f5c965ba5db18db"],["/bower_components/code-mirror/styles/twilight-styles.html","d305a5dd01cf993f4fa1db692b7e6615"],["/bower_components/code-mirror/styles/vibrant-ink-styles.html","ff519a531122d165370bb99f8412f61e"],["/bower_components/code-mirror/styles/xq-dark-styles.html","e169f6ba0d10d62efbe11070f762b62f"],["/bower_components/code-mirror/styles/xq-light-styles.html","513c763cc063597b763ebafea1dde418"],["/bower_components/code-mirror/styles/zenburn-styles.html","304b8edc874f891ecfcb99b653eec711"],["/bower_components/codemirror/addon/mode/loadmode.js","6eb4ac9f24c5a2d7319515988cb655b4"],["/bower_components/codemirror/lib/codemirror.js","2719da3d45f02b4cdeacef328d259d0a"],["/bower_components/codemirror/mode/htmlmixed/htmlmixed.js","c953202cc23df9fa37e9ed48901d5fe1"],["/bower_components/codemirror/mode/meta.js","c8c6ab0328956aaa5b3fa1920b7062ef"],["/bower_components/cryptojslib/rollups/md5.js","82cad5af7bcd413ae7e9e4900ab18b68"],["/bower_components/date-time/date-time.html","08063718941db19a695682aa64171b38"],["/bower_components/docs-parameters-table/docs-body-parameters-table.html","4093320677e9e0a69530aa8e499cb361"],["/bower_components/docs-parameters-table/docs-body-table.html","293e44ef8bda26c79447f4436c5be5af"],["/bower_components/docs-parameters-table/docs-form-parameters-table.html","f864bcca6d72e244451bd50daf19ecda"],["/bower_components/docs-parameters-table/docs-headers-table.html","2a90dddad70742bb963098b7ffbccb2b"],["/bower_components/docs-parameters-table/docs-json-parameters-table.html","55fb57b483697a6f0d3bbcf6d6921cf4"],["/bower_components/docs-parameters-table/docs-parameters-behavior.html","890e05ff09ceaa8a964030cbc53e8593"],["/bower_components/docs-parameters-table/docs-parameters-table-shared-styles.html","f0bdd80fa3eca0007384742c003bfd45"],["/bower_components/docs-parameters-table/docs-parameters-table.html","112f2d1e9e5f27fd9fbc596d569efcd2"],["/bower_components/docs-parameters-table/docs-xml-parameters-table.html","7b32448a089b61d8e73b28027b37f56b"],["/bower_components/docs-parameters-table/structure-display.html","c6c27b70051c6d7cc35582acfb86e432"],["/bower_components/error-message/error-message.html","02690aa161f9f6ae62ecb458b9a694c8"],["/bower_components/fetch-polyfill/fetch-polyfill.html","f3dd60ab9794368730ed2a4bdc2bbadd"],["/bower_components/fetch/fetch.js","f12fc754bbd66a3d50c516237e8dda52"],["/bower_components/font-roboto/roboto.html","09500fd5adfad056ff5aa05e2aae0ec5"],["/bower_components/headers-list-view/headers-list-item-value.html","662173348d541275bebb7378393d39ab"],["/bower_components/headers-list-view/headers-list-item.html","d30dc018509653937a0a533dd2e4d386"],["/bower_components/headers-list-view/headers-list-view.html","6dcc383027b2262ea0e98944919efaea"],["/bower_components/headers-parser-behavior/headers-parser-behavior.html","0d327417b4a9e4b0f839f7b880c81cfb"],["/bower_components/iron-a11y-announcer/iron-a11y-announcer.html","a3bd031e39dde38cb8e619f670ee50f7"],["/bower_components/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html","c4c3d44402c9d456c38c14da04d206b9"],["/bower_components/iron-a11y-keys/iron-a11y-keys.html","fd2760ee5676b7615aaa24d695c5295d"],["/bower_components/iron-ajax/iron-ajax.html","d606b330d7bd040660a53a5cda7f8acf"],["/bower_components/iron-ajax/iron-request.html","c2d289c4b20653353cff315cf247a45e"],["/bower_components/iron-behaviors/iron-button-state.html","6565a80d1af09299c1201f8286849c3b"],["/bower_components/iron-behaviors/iron-control-state.html","1c12ee539b1dbbd0957ae26b3549cc13"],["/bower_components/iron-checked-element-behavior/iron-checked-element-behavior.html","6fd1055c2c04382401dc910a0db569c6"],["/bower_components/iron-collapse/iron-collapse.html","30ca05c987397312c698967a9bbe6499"],["/bower_components/iron-dropdown/iron-dropdown-scroll-manager.html","fe09653502aaa6271d6ba8533de60f22"],["/bower_components/iron-dropdown/iron-dropdown.html","0c8c3226b6e6a351b098fa4d794ee702"],["/bower_components/iron-fit-behavior/iron-fit-behavior.html","884c6983ce660f254b47b5d69819f44d"],["/bower_components/iron-flex-layout/classes/iron-flex-layout.html","52518a396b7b6638323e33320af1e2a5"],["/bower_components/iron-flex-layout/classes/iron-shadow-flex-layout.html","82233435af1c9e0c4f7533a5db91d30f"],["/bower_components/iron-flex-layout/iron-flex-layout.html","be17bfc442cd8270b7dec1bb39051621"],["/bower_components/iron-form-element-behavior/iron-form-element-behavior.html","a64177311979fc6a6aae454cb85ea2be"],["/bower_components/iron-form/iron-form.html","d567cf610fac57ae3c30af80c5400750"],["/bower_components/iron-icon/iron-icon.html","f2a0dfd0b79864b4f4efb578417a3fef"],["/bower_components/iron-iconset-svg/iron-iconset-svg.html","8d0d7213b8c3325ca7e5a658ca9aaf17"],["/bower_components/iron-input/iron-input.html","3e393eda6c241be2817ce0acc512bcf6"],["/bower_components/iron-location/iron-location.html","0ca9fd93d23992a9340ce7c433557226"],["/bower_components/iron-location/iron-query-params.html","32a96be5536aea89a925d16146cb7015"],["/bower_components/iron-media-query/iron-media-query.html","7436f9608ebd2d31e4b346921651f84b"],["/bower_components/iron-menu-behavior/iron-menu-behavior.html","2b9d30d90893eba83cb702c70b6e6b29"],["/bower_components/iron-menu-behavior/iron-menubar-behavior.html","a0cc6674fc6d9d7ba0b68ff680b4e56b"],["/bower_components/iron-meta/iron-meta.html","dd4ef14e09c5771e70292d70963f6718"],["/bower_components/iron-overlay-behavior/iron-focusables-helper.html","1607d4d8a7d922ade7894167368ccc31"],["/bower_components/iron-overlay-behavior/iron-overlay-backdrop.html","35013b4b97041ed6b63cf95dbb9fbcb4"],["/bower_components/iron-overlay-behavior/iron-overlay-behavior.html","9e9090df0515a2c8b755bd9c2e944b45"],["/bower_components/iron-overlay-behavior/iron-overlay-manager.html","707308044cec15e2d3c85cd28d152e89"],["/bower_components/iron-pages/iron-pages.html","5872a2ad58225c94b14ddea747f67cbd"],["/bower_components/iron-range-behavior/iron-range-behavior.html","34f5b83882b6b6c5cfad7543caab080e"],["/bower_components/iron-resizable-behavior/iron-resizable-behavior.html","e93449ccd4312e4e30060c87bd52ed25"],["/bower_components/iron-scroll-target-behavior/iron-scroll-target-behavior.html","d0eb39331820f58f3cdcebaa0eed0209"],["/bower_components/iron-selector/iron-multi-selectable.html","46d6620acd7bad986d81097d9ca91692"],["/bower_components/iron-selector/iron-selectable.html","65b04f3f5f1b551d91a82b36f916f6b6"],["/bower_components/iron-selector/iron-selection.html","83545b7d1eae4020594969e6b9790b65"],["/bower_components/iron-selector/iron-selector.html","4d2657550768bec0788eba5190cddc66"],["/bower_components/iron-validatable-behavior/iron-validatable-behavior.html","02bf0434cc1a0d09e18413dea91dcea1"],["/bower_components/json-table/json-table-array.html","9f17fce71e64ff1a4a201827c821f42b"],["/bower_components/json-table/json-table-behavior.html","9b4cfc95ec45649826f1a9c5b1f23b15"],["/bower_components/json-table/json-table-object.html","3d04695608c1f0feccc2c389cfa495f4"],["/bower_components/json-table/json-table-primitive-teaser.html","5882d34e1717f8f6b3898a3a07347ee1"],["/bower_components/json-table/json-table.html","6cca79a83878c0e7c74cad9137f60f4c"],["/bower_components/json-viewer/js-max-number-error.html","03af0efc44ef657c3c540e66233aef08"],["/bower_components/json-viewer/json-viewer.html","88f2b29db61fd169e1e7b0de7648af29"],["/bower_components/markdown-styles/markdown-styles.html","3f4d6dc74105b92d57c25e4cb310c4a1"],["/bower_components/marked-element/marked-element.html","05fe17af531201607a52fcecb1e4b928"],["/bower_components/marked-element/marked-import.html","935603373e4046660d3944abb73939f1"],["/bower_components/marked/lib/marked.js","eb770edf3f9eec6adb25b8fe65e15312"],["/bower_components/neon-animation/animations/fade-in-animation.html","b814c818dbcffe2bb50563e1406497df"],["/bower_components/neon-animation/animations/fade-out-animation.html","44988226230af0e6d92f0988fc8688e2"],["/bower_components/neon-animation/animations/opaque-animation.html","8e2f63bbc648796f3ed96834a5553d07"],["/bower_components/neon-animation/neon-animatable-behavior.html","270f52231303cae4cb8e3fadb5a805c1"],["/bower_components/neon-animation/neon-animation-behavior.html","eb1cdd9cd9d780a811fd25e882ba1f8e"],["/bower_components/neon-animation/neon-animation-runner-behavior.html","782cac67e6cb5661d36fb32d9129ff03"],["/bower_components/neon-animation/web-animations.html","b310811179297697d51eac3659df7776"],["/bower_components/oauth-authorization/oauth2-authorization.html","b068779e99b87e8152b777a3168af298"],["/bower_components/oauth2-scope-selector/oauth2-scope-selector.html","fda6091c4948b7195dee2fe05126f25a"],["/bower_components/paper-autocomplete/paper-autocomplete.html","af19486b6a357c4b47c5587b4274d5ea"],["/bower_components/paper-behaviors/paper-button-behavior.html","edddd3f97cf3ea944f3a48b4154939e8"],["/bower_components/paper-behaviors/paper-checked-element-behavior.html","59702db25efd385b161ad862b8027819"],["/bower_components/paper-behaviors/paper-inky-focus-behavior.html","51a1c5ccd2aae4c1a0258680dcb3e1ea"],["/bower_components/paper-behaviors/paper-ripple-behavior.html","b6ee8dd59ffb46ca57e81311abd2eca0"],["/bower_components/paper-button/paper-button.html","3f061a077ee938fac479622156071296"],["/bower_components/paper-checkbox/paper-checkbox.html","1c5af2743fed525fe96db75f8a12b2d2"],["/bower_components/paper-dialog-behavior/paper-dialog-behavior.html","b9cf5384b29cd12a724965080916b6f1"],["/bower_components/paper-dialog-behavior/paper-dialog-shared-styles.html","8fb5282b6149bc429b6baef5c077a285"],["/bower_components/paper-dialog-scrollable/paper-dialog-scrollable.html","49e3023a68129496c360dc9613f34bfc"],["/bower_components/paper-dialog/paper-dialog.html","7a8d86ed89c215baf8cc42e4d7335271"],["/bower_components/paper-dropdown-menu/paper-dropdown-menu-icons.html","d309383cfdcf6733d4e6827c3b877c72"],["/bower_components/paper-dropdown-menu/paper-dropdown-menu-shared-styles.html","c18c68e91e13e2102f577c1c55ce7598"],["/bower_components/paper-dropdown-menu/paper-dropdown-menu.html","879115bf8199d7d13c336144a32115d4"],["/bower_components/paper-icon-button/paper-icon-button.html","2a75de00f858ae1e894ab21344464787"],["/bower_components/paper-input/paper-input-addon-behavior.html","de7b482dc1fb01847efba9016db16206"],["/bower_components/paper-input/paper-input-behavior.html","3960579058d3ba0a74ae7b67b78f53c2"],["/bower_components/paper-input/paper-input-char-counter.html","94c2003f281325951e3bf5b927a326bb"],["/bower_components/paper-input/paper-input-container.html","0ddbde66d15452d5bdec103ef876e5af"],["/bower_components/paper-input/paper-input-error.html","b90f3a86d797f1bdbbb4d158aeae06ab"],["/bower_components/paper-input/paper-input.html","3385511052db3467ca6ec155faa619ad"],["/bower_components/paper-item/paper-item-behavior.html","82636a7562fd8b0be5b15646ee461588"],["/bower_components/paper-item/paper-item-body.html","8b91d21da1ac0ab23442d05b4e377286"],["/bower_components/paper-item/paper-item-shared-styles.html","31466267014182098267f1b9303f656e"],["/bower_components/paper-item/paper-item.html","e614731572c425b144aa8a9da24ee3ea"],["/bower_components/paper-listbox/paper-listbox.html","bfbc631d72b3e7b2b611c9a32430e3c6"],["/bower_components/paper-masked-input/paper-masked-input.html","69e41875e2381a25161ea1e16fcc71f7"],["/bower_components/paper-masked-input/paper-masked-input.js","e101fa7eb6476003d7e57fa7f324c341"],["/bower_components/paper-material/paper-material-shared-styles.html","d0eeeb696e55702f3a38ef1ad0058f59"],["/bower_components/paper-material/paper-material.html","47301784c93c3d9989abfbab68ec9859"],["/bower_components/paper-menu-button/paper-menu-button-animations.html","a6d6ed67a145ca00d4487c40c4b06273"],["/bower_components/paper-menu-button/paper-menu-button.html","2b2f79e8b3b50e4aabd2dd3ada9b6814"],["/bower_components/paper-menu/paper-menu-shared-styles.html","9b2ae6e8b26011a37194ea3b4bdd043d"],["/bower_components/paper-menu/paper-menu.html","5270d7b4b603d9fdfcfdb079c750a3cd"],["/bower_components/paper-progress/paper-progress.html","5dd0b9f89efdfd4f3cce0a13bd67fe6f"],["/bower_components/paper-ripple/paper-ripple.html","e22bc21b61184cb28125d16f9d80fb59"],["/bower_components/paper-spinner/paper-spinner-behavior.html","82e814c4460e8803f6f57cc457658adf"],["/bower_components/paper-spinner/paper-spinner-styles.html","a2122d2c0f3ac98e6911160d8886d31a"],["/bower_components/paper-spinner/paper-spinner.html","940e64bbde54dad918d0f5c0e247a8bd"],["/bower_components/paper-styles/color.html","430305db311431da78c0a6e1236f9ebe"],["/bower_components/paper-styles/default-theme.html","c910188e898624eb890898418de20ee0"],["/bower_components/paper-styles/paper-styles.html","3fd71f69f3adc823ef9c03611d296cfc"],["/bower_components/paper-styles/shadow.html","fc449492f51292636b499bc5d7b9b036"],["/bower_components/paper-styles/typography.html","bdd7f31bb85f116ce97061c4135b74c9"],["/bower_components/paper-tabs/paper-tab.html","395fdc6be051eb7218b1c77a94eff726"],["/bower_components/paper-tabs/paper-tabs-icons.html","9fb57777c667562392afe684d85ddbe2"],["/bower_components/paper-tabs/paper-tabs.html","b2a17f55f79d24c9c4046ffd361636b9"],["/bower_components/paper-toast/paper-toast.html","f64d10724104f3751cae8b764aef56ff"],["/bower_components/paper-tooltip/paper-tooltip.html","ba34997662a16417bf99bac94287a986"],["/bower_components/payload-parser-behavior/payload-parser-behavior.html","e6fbbddd252f39db34911c711cea2f3b"],["/bower_components/polymer/polymer-micro.html","54ff0b440c8f9e346afd3bea5c340120"],["/bower_components/polymer/polymer-mini.html","99da171cb18148c2147ea8dd0a6dbc5a"],["/bower_components/polymer/polymer.html","74553dc61f5b3f5138d044de0fea721c"],["/bower_components/prism-element/prism-highlighter.html","d46d0ba17ad96d2732d9bff0d7139c5b"],["/bower_components/prism-element/prism-import.html","94e49629fc3c5cb76c1e23563547923f"],["/bower_components/prism-element/prism-theme-default.html","440043a3ffdbed9376cfe428c9af6051"],["/bower_components/prism-highlight/prism-highlight.html","2473370124dc7b95e5c1a1902486738a"],["/bower_components/prism-highlight/prism-import.html","604de06cd9176959e921f1f41020843f"],["/bower_components/prism-highlight/prism-styles.html","e5dc3c82be7fdbd1fa46d98e3bcd8349"],["/bower_components/prism/prism.js","69667d54be5bff2bf94190b92fcd3ba2"],["/bower_components/prism/themes/prism.css","298e3aafa62f48b863042aa3696a2b34"],["/bower_components/promise-polyfill/Promise-Statics.js","a4fbefd3bdb3ab76e6e7f788a902f7ba"],["/bower_components/promise-polyfill/Promise.js","5afb14fd81497aca81bf25929d65b02d"],["/bower_components/promise-polyfill/promise-polyfill-lite.html","06470312beff013fc54695e0bdda2cb3"],["/bower_components/promise-polyfill/promise-polyfill.html","97dd009429dbc654aa105abcd0dfb927"],["/bower_components/raml-aware/raml-aware.html","309278b97c154fe7b382dbb01d400a9a"],["/bower_components/raml-behaviors/raml-behavior.html","d70bd8bd1aee37305ee718391dda74c5"],["/bower_components/raml-body-editor-panel/cm-arc-styles.html","19cd40f0d398492ba71c8e3faea572ae"],["/bower_components/raml-body-editor-panel/raml-body-editor-panel.html","b405ef686553bf7028ad5c0894994699"],["/bower_components/raml-docs-documentation-viewer/raml-docs-documentation-viewer.html","b49c03c28d15d3b203291fd1115f45fc"],["/bower_components/raml-docs-method-viewer/raml-docs-method-viewer.html","4803091eb4098ba4c2e42d5afdaecdd0"],["/bower_components/raml-docs-resource-viewer/raml-docs-resource-viewer.html","812dae09934ba7a56bf3a2670a3b6c9e"],["/bower_components/raml-docs-response-panel/raml-docs-response-panel.html","da8122ca0db37016a28f9883094282ff"],["/bower_components/raml-docs-types-viewer/raml-docs-types-viewer.html","f395ab550b39b1241cd29213ba21be39"],["/bower_components/raml-documentation-panel/raml-documentation-empty-state.html","57bea3af158d9b72b980f3a5cdcabc03"],["/bower_components/raml-documentation-panel/raml-documentation-panel-icons.html","1cfb130a67737335f06797fad9bd3aba"],["/bower_components/raml-documentation-panel/raml-documentation-panel.html","330d706ac1bb121556b6fb041c65d621"],["/bower_components/raml-headers-form/raml-headers-form.html","010beb48c3c642f9ebe9e8d09ce6a95d"],["/bower_components/raml-js-parser/polyfills.js","f9fdcb65e10594093dae53a48537cf2d"],["/bower_components/raml-js-parser/raml-1-parser.js","8c02901886b316eb6bad4928b9114e2d"],["/bower_components/raml-js-parser/raml-js-parser-imports.html","ad016d6bc511d952554f680f6b1b675a"],["/bower_components/raml-js-parser/raml-js-parser.html","51df81a49549e02f2a4aa69b14cb8336"],["/bower_components/raml-json-enhance/raml-json-enhance.html","7a2ae8fdf04cad4091448a6f80466679"],["/bower_components/raml-path-selector/path-selector-behavior.html","9f3f81e07c171569abab573f882f9996"],["/bower_components/raml-path-selector/path-selector-documentation.html","249a9767db8c2030c9c0591b198728f8"],["/bower_components/raml-path-selector/path-selector-resource.html","86a18a6dcf442b6149f1c6a82144fdb3"],["/bower_components/raml-path-selector/path-selector-styles.html","8a087f62c519918d21d1aa641d214b67"],["/bower_components/raml-path-selector/path-selector-types.html","31601f2ff27577fc72672a5ab9b519de"],["/bower_components/raml-path-selector/raml-documentation-tree-item.html","9a8a37fa112d16aeeb62ee12001b184b"],["/bower_components/raml-path-selector/raml-path-selector.html","1ca51cc11b52f0cad4a3c8922371b063"],["/bower_components/raml-path-selector/raml-resource-tree-item.html","700f8724d4ae01ae06515e902f30ce57"],["/bower_components/raml-path-selector/raml-structure-tree.html","2a26a282cd028939470b37a81457612e"],["/bower_components/raml-path-selector/raml-tree-item-behavior.html","02e14e400529ae35aa6623ffaaa8ab00"],["/bower_components/raml-path-selector/raml-tree-item-styles.html","ff44b7485e729218b79362e63b3d3fbd"],["/bower_components/raml-path-selector/raml-type-tree-item.html","f2a3a5d140b0e63e90f78bfeb7ddbbce"],["/bower_components/raml-path-to-object/raml-path-to-object.html","a18e13278b68ee6287b8b9417ca14d88"],["/bower_components/raml-request-headers-editor/cm-arc-styles.html","669bb1afe360e5e6454e929a34a2374f"],["/bower_components/raml-request-headers-editor/cm-headers-addon.js","88fbfaecc1a2b5d6e34088aae5feac52"],["/bower_components/raml-request-headers-editor/cm-hint-http-headers.js","5c24d9c0cb263e210e72f3963d19f8c5"],["/bower_components/raml-request-headers-editor/cm-modules-import.html","5c5c379db357d0296e5103387a8aaec7"],["/bower_components/raml-request-headers-editor/cm-show-hint.js","e0edcfbc041c4afc31acf0391e9820cb"],["/bower_components/raml-request-headers-editor/raml-request-headers-editor.html","f60cf35454e31cc9d52431333bdd58b6"],["/bower_components/raml-request-panel/raml-request-panel-simple-xhr.html","854cb79964d2459817f811bdef5a2dd8"],["/bower_components/raml-request-panel/raml-request-panel.html","082116a2323e5f7689f21ff97b92dab0"],["/bower_components/raml-request-parameters-editor/raml-request-parameters-editor.html","47a14708228e685b9ac83cf6f8f192ea"],["/bower_components/raml-request-parameters-editor/raml-request-parameters-form.html","10cd0c1456a61fa6778aa6dd52d8116e"],["/bower_components/raml-request-url-editor/raml-request-url-editor.html","8d881518a8027d62235fdb63ada13c93"],["/bower_components/raml-request-url-editor/url-input.html","9ce9dbf508b062dcf894a8c3174403e4"],["/bower_components/raml-summary-view/raml-summary-view.html","09672f33184f0cbe0a3565474a8099d9"],["/bower_components/request-timings/request-timings-panel.html","ee2e15575cbe7fcf069738e7e026ef2d"],["/bower_components/request-timings/request-timings.html","54ced6545da5137ad456c255add61902"],["/bower_components/response-body-view/response-body-view.html","e1cdd0aab1afc2853b5192c98df44b95"],["/bower_components/response-error-view/response-error-view.html","e26ef786553132e090070153866d49f7"],["/bower_components/response-highlighter/response-highlighter.html","c478fea775adef81e02a91fc6fc51923"],["/bower_components/response-raw-viewer/response-raw-viewer.html","c300e4d57747c8c65b56c98db80284ac"],["/bower_components/response-status-view/http-source-message-view.html","8c15bc45fd062c5345af48d4c6b6a2d8"],["/bower_components/response-status-view/response-status-view.html","9464e03732d1b674ef9c4cd25c481d75"],["/bower_components/response-status-view/status-message.html","021cdf1241bb037c1ae11c28ef8306f1"],["/bower_components/response-view/response-view.html","cb9e7d219f015b98d83197ee9864c8e5"],["/bower_components/text-search-behavior/text-search-behavior.html","0f6f3b6399e8f62ff6db80d8947a0466"],["/bower_components/web-animations-js/web-animations-next-lite.min.js","04197e2ccec914fa460eef2ac140c853"],["/bower_components/webcomponentsjs/webcomponents-lite.min.js","02395895d5d08242c6ba93518a6da2c5"],["/bower_components/xml-viewer/xml-viewer.html","9171cd035e535e2688ebea45f0cc93e4"],["/index.html","88129d9985f6b7b463e353e4b4234bc6"],["/manifest.json","5120ac22c707f311d088b94ba5ca80ed"],["/src/api-console-app.html","fde2fb8b9177097dab139a65b8a65801"],["/src/api-console-styles.html","39101a38ee658702aa1a1968c8642822"],["/src/docs.html","267de9abee58321407bbc4116a77c0b8"],["/src/request.html","6f486882acdd9db30076af45e0fe3b63"],["/src/view404.html","6fdb77e7c1f4f6936b55127292007876"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, param) {
    param = param || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + param;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    // Take a look at each of the cache names we expect for this version.
    Promise.all(Object.keys(CurrentCacheNamesToAbsoluteUrl).map(function(cacheName) {
      return caches.open(cacheName).then(function(cache) {
        // Get a list of all the entries in the specific named cache.
        // For caches that are already populated for a given version of a
        // resource, there should be 1 entry.
        return cache.keys().then(function(keys) {
          // If there are 0 entries, either because this is a brand new version
          // of a resource or because the install step was interrupted the
          // last time it ran, then we need to populate the cache.
          if (keys.length === 0) {
            // Use the last bit of the cache name, which contains the hash,
            // as the cache-busting parameter.
            // See https://github.com/GoogleChrome/sw-precache/issues/100
            var cacheBustParam = cacheName.split('-').pop();
            var urlWithCacheBusting = getCacheBustedUrl(
              CurrentCacheNamesToAbsoluteUrl[cacheName], cacheBustParam);

            var request = new Request(urlWithCacheBusting,
              {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName],
                  response);
              }

              console.error('Request for %s returned a response status %d, ' +
                'so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          }
        });
      });
    })).then(function() {
      return caches.keys().then(function(allCacheNames) {
        return Promise.all(allCacheNames.filter(function(cacheName) {
          return cacheName.indexOf(CacheNamePrefix) === 0 &&
            !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '/index.html';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html') &&
        /* eslint-disable quotes, comma-spacing */
        isPathWhitelisted([], event.request.url)) {
        /* eslint-enable quotes, comma-spacing */
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});




