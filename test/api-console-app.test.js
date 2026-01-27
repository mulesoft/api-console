/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-console-app.js';

/** @typedef {import('../src/ApiConsoleApp.js').ApiConsoleApp} ApiConsoleApp */

describe('ApiConsoleApp', () => {
  /**
   * @returns {Promise<ApiConsoleApp>}
   */
  async function appFixture(amf) {
    return fixture(html`<api-console-app .amf="${amf}"></api-console-app>`);
  }

  describe('gRPC API support', () => {
    let grpcAmf;
    let regularAmf;

    before(async () => {
      grpcAmf = await AmfLoader.load({ fileName: 'grpc-test', compact: false });
      regularAmf = await AmfLoader.load({ fileName: 'demo-api', compact: false });
    });

    describe('_computeRenderInlineTryIt()', () => {
      it('returns false for gRPC API even with wideLayout and method', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        // Simulate wide layout and method selection
        element.wideLayout = true;
        element.selectedShapeType = 'method';
        await nextFrame();
        
        const result = element._computeRenderInlineTryIt(true, true, false);
        assert.isFalse(result, 'Should return false for gRPC API');
      });

      it('returns true for regular WebAPI with wideLayout and method', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        element.wideLayout = true;
        element.selectedShapeType = 'method';
        await nextFrame();
        
        const result = element._computeRenderInlineTryIt(true, true, false);
        assert.isTrue(result, 'Should return true for regular WebAPI');
      });

      it('returns false when not wideLayout', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        const result = element._computeRenderInlineTryIt(false, true, false);
        assert.isFalse(result, 'Should return false when not wideLayout');
      });

      it('returns false when not a method', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        const result = element._computeRenderInlineTryIt(true, false, false);
        assert.isFalse(result, 'Should return false when not a method');
      });

      it('returns false when inlineMethods is true', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const result = element._computeRenderInlineTryIt(true, true, true);
        assert.isFalse(result, 'Should return false when inlineMethods is true');
      });

      it('returns false when not WebAPI (e.g., AsyncAPI)', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        // Mock _isWebAPI to return false
        const originalIsWebAPI = element._isWebAPI;
        element._isWebAPI = () => false;
        
        const result = element._computeRenderInlineTryIt(true, true, false);
        assert.isFalse(result, 'Should return false when not WebAPI');
        
        // Restore original method
        element._isWebAPI = originalIsWebAPI;
      });
    });

    describe('_computeNoTryItValue()', () => {
      it('returns true for gRPC API', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        const result = element._computeNoTryItValue(false, false);
        assert.isTrue(result, 'Should return true for gRPC API');
      });

      it('returns false for regular WebAPI when noTryIt is false', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const result = element._computeNoTryItValue(false, false);
        assert.isFalse(result, 'Should return false for regular WebAPI');
      });

      it('returns true when renderInlineTyit is true', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const result = element._computeNoTryItValue(false, true);
        assert.isTrue(result, 'Should return true when renderInlineTyit is true');
      });

      it('returns true when noTryIt is explicitly true', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const result = element._computeNoTryItValue(true, false);
        assert.isTrue(result, 'Should return true when noTryIt is true');
      });

      it('returns true when not WebAPI', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        // Mock _isWebAPI to return false
        const originalIsWebAPI = element._isWebAPI;
        element._isWebAPI = () => false;
        
        const result = element._computeNoTryItValue(false, false);
        assert.isTrue(result, 'Should return true when not WebAPI');
        
        // Restore original method
        element._isWebAPI = originalIsWebAPI;
      });
    });

    describe('try-panel rendering', () => {
      it('does not render inline try-panel for gRPC API', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        // Set wide layout and select a method
        element.wideLayout = true;
        const webApi = AmfLoader.lookupWebApi(grpcAmf);
        const endpoints = element._computeEndpoints(webApi);
        if (endpoints && endpoints.length > 0) {
          const operations = element._computePropertyArray(
            endpoints[0],
            element.ns.aml.vocabularies.apiContract.supportedOperation
          );
          if (operations && operations.length > 0) {
            element.selectedShape = operations[0]['@id'];
            element.selectedShapeType = 'method';
            await nextFrame();
            await nextFrame();
            
            // Check that inline try-panel is not rendered
            const inlineRequest = element.shadowRoot.querySelector('.inline-request');
            assert.isNull(inlineRequest, 'Inline try-panel should not be rendered for gRPC API');
          }
        }
      });

      it('hides try-it button for gRPC API', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        // Select a method
        const webApi = AmfLoader.lookupWebApi(grpcAmf);
        const endpoints = element._computeEndpoints(webApi);
        if (endpoints && endpoints.length > 0) {
          const operations = element._computePropertyArray(
            endpoints[0],
            element.ns.aml.vocabularies.apiContract.supportedOperation
          );
          if (operations && operations.length > 0) {
            element.selectedShape = operations[0]['@id'];
            element.selectedShapeType = 'method';
            await nextFrame();
            await nextFrame();
            
            // Check that _noTryItValue is true
            assert.isTrue(element._noTryItValue, 'Try-it button should be hidden for gRPC API');
          }
        }
      });
    });

    describe('_isGrpcApi() detection', () => {
      it('correctly detects gRPC API', async () => {
        const element = await appFixture(grpcAmf);
        await nextFrame();
        
        const isGrpc = element._isGrpcApi(grpcAmf);
        assert.isTrue(isGrpc, 'Should detect gRPC API');
      });

      it('correctly detects non-gRPC API', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const isGrpc = element._isGrpcApi(regularAmf);
        assert.isFalse(isGrpc, 'Should not detect regular API as gRPC');
      });

      it('returns false when amf is null or undefined', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        const isGrpcNull = element._isGrpcApi(null);
        const isGrpcUndefined = element._isGrpcApi(undefined);
        
        assert.isFalse(isGrpcNull, 'Should return false for null');
        assert.isFalse(isGrpcUndefined, 'Should return false for undefined');
      });
    });

    describe('_updateRenderInlineTyit() integration', () => {
      it('updates _renderInlineTryit and _noTryItValue when wideLayout changes', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        element.selectedShapeType = 'method';
        element.wideLayout = true;
        await nextFrame();
        
        assert.isTrue(element._renderInlineTryit, 'Should render inline tryit for regular API');
        assert.isTrue(element._noTryItValue, 'Should hide try-it button when inline is rendered');
      });

      it('updates _renderInlineTryit and _noTryItValue when switching to gRPC API', async () => {
        const element = await appFixture(regularAmf);
        await nextFrame();
        
        element.wideLayout = true;
        element.selectedShapeType = 'method';
        await nextFrame();
        await element.updateComplete;
        
        // Initially should render inline tryit for regular API
        assert.isTrue(element._renderInlineTryit, 'Should initially render inline tryit');
        
        // Switch to gRPC API
        element.amf = grpcAmf;
        await element.updateComplete;
        await nextFrame();
        
        // Manually trigger update since _processModelChange doesn't call _updateRenderInlineTyit
        // (to avoid performance issues with large APIs)
        element._updateRenderInlineTyit();
        await element.updateComplete;
        
        // Should not render inline tryit for gRPC
        assert.isFalse(element._renderInlineTryit, 'Should not render inline tryit for gRPC');
        assert.isTrue(element._noTryItValue, 'Should hide try-it button for gRPC');
      });
    });
  });
});
