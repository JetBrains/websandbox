/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-magic-numbers */
import {escapePathPart, propertyByPath, splitPath, unescapePathPart} from '../lib/object-path';

describe('object extensions', () => {
  it('should find top level property', () => {
    (propertyByPath({foo: 123}, 'foo')).should.equal(123);
  });

  it('should find nested property', () => {
    (propertyByPath({foo: {bar: 321}}, 'foo.bar')).should.equal(321);
  });

  it('should return null if given path does not exist', () => {
    (propertyByPath({foo: {bar: 321}}, 'foo2222.bar') === null).should.be.true;
  });

  it('should find array property', () => {
    (propertyByPath({foo: [{bar: 321}]}, 'foo[0].bar')).should.equal(321);
  });

  it('should find property by ["foo"] syntax', () => {
    (propertyByPath({foo: 123}, '["foo"]')).should.equal(123);
  });

  it('should find nested property by [""] syntax', () => {
    (propertyByPath({foo: {bar: 321}}, 'foo.["bar"]')).should.equal(321);
  });

  it('should find nested property by escaped [""] syntax', () => {
    (propertyByPath({fields: {'Some Member': 321}}, 'fields["Some\\ Member"]')).should.equal(321);
  });

  describe('escapePathPart', () => {
    it('should escape dots in path part', () => {
      (escapePathPart('foo.bar')).should.equal('["foo\\.bar"]');
    });

    it('should escape quotes in path part', () => {
      (escapePathPart('foo"bar')).should.equal('["foo\\"bar"]');
    });

    it('should escape spaces in path part', () => {
      (escapePathPart('foo bar')).should.equal('["foo\\ bar"]');
    });

    it('should escape brackets in path part', () => {
      (escapePathPart('foo[bar')).should.equal('["foo\\[bar"]');
    });

    it('should escape colons in path part', () => {
      (escapePathPart('foo:bar')).should.equal('["foo\\:bar"]');
    });

    it('should escape semicolons in path part', () => {
      (escapePathPart('foo;bar')).should.equal('["foo\\;bar"]');
    });

    it('should escape multiple bad symbols in path part', () => {
      (escapePathPart('fo o[b.ar')).should.equal('["fo\\ o\\[b\\.ar"]');
    });
  });

  describe('unescapePathPart', () => {
    it('should unescape dots in path part', () => {
      (unescapePathPart('["foo\\.bar"]')).should.equal('foo.bar');
    });

    it('should unescape colons in path part', () => {
      (unescapePathPart('["foo\\:bar"]')).should.equal('foo:bar');
    });
  });

  describe('splitPath', () => {
    it('should split simple path', () => (splitPath('foo.bar')).should.deep.equal(['foo', 'bar']));
    it('should split array path', () => (splitPath('foo[0]')).should.deep.equal(['foo', '0']));
    it('should split square bracketed path', () =>
      (splitPath('foo["bar"].test')).should.deep.equal(['foo', 'bar', 'test']));

    it('should split square bracketed path with dot', () =>
      (splitPath('foo["with\\.dots"].test')).should.deep.equal(['foo', 'with.dots', 'test']));

    it('should split square bracketed path with space', () =>
      (splitPath('foo["with\\ dots"].test')).should.deep.equal(['foo', 'with dots', 'test']));
  });
});
