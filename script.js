const areaSelector = new AreaSelector({
  element: document.querySelector('#grid'),
  selectableTargetSelector: '.item',
  dataSetKeyForSelection: 'id',
  onSelectionChange: (selectedIds) => {
    console.log('selectedIds', selectedIds);
  }
});